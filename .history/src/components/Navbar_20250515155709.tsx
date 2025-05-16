import Link from 'next/link'
import { useTranslation } from 'react-i18next'

const Navbar: React.FC = () => {
  const { t } = useTranslation()

  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center space-x-4">
        <Link href="/collection/accept_problem" className="text-black hover:text-gray-600">
          {t('navbar.acceptProblem')}
        </Link>
        <Link href="/collection/back-to-summer" className="text-black hover:text-gray-600">
          {t('navbar.backToSummer')}
        </Link>
        <Link href="/collection/chill-calm-down" className="text-black hover:text-gray-600">
          {t('navbar.chillCalmDown')}
        </Link>
      </div>
    </div>
  )
}

export default Navbar 