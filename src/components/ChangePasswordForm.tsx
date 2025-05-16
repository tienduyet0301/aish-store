import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';

type FormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export default function ChangePasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors }, watch } = useForm<FormData>();
  const newPassword = watch('newPassword');

  const onSubmit = async (data: FormData) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Mật khẩu mới không khớp');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Có lỗi xảy ra');
      }

      toast.success('Đổi mật khẩu thành công');
      reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
          Mật khẩu hiện tại
        </label>
        <input
          type="password"
          id="currentPassword"
          {...register('currentPassword', { required: 'Vui lòng nhập mật khẩu hiện tại' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
        />
        {errors.currentPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.currentPassword.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
          Mật khẩu mới
        </label>
        <input
          type="password"
          id="newPassword"
          {...register('newPassword', {
            required: 'Vui lòng nhập mật khẩu mới',
            minLength: {
              value: 8,
              message: 'Mật khẩu phải có ít nhất 8 ký tự'
            }
          })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
        />
        {errors.newPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          Xác nhận mật khẩu mới
        </label>
        <input
          type="password"
          id="confirmPassword"
          {...register('confirmPassword', {
            required: 'Vui lòng xác nhận mật khẩu mới',
            validate: value => value === newPassword || 'Mật khẩu không khớp'
          })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
        )}
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full justify-center rounded-md border border-transparent bg-black py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
        </button>
      </div>
    </form>
  );
} 