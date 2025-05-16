"use client";
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function HelpPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-xl p-6 text-center">
        <Image
          src="/images/logo.png"
          alt="AISH Logo"
          width={120}
          height={40}
          className="mx-auto mb-8"
        />
        
        <h1 style={{ 
          fontSize: "1.1em", 
          color: "#000000", 
          textTransform: "uppercase", 
          letterSpacing: "0.1em", 
          marginBottom: "24px",
          fontWeight: "600"
        }}>
          Liên hệ với chúng tôi
        </h1>

        <div style={{
          padding: "24px",
          border: "1px solid #e5e7eb",
          borderRadius: "6px",
          marginBottom: "24px"
        }}>
          <div style={{ marginBottom: "20px" }}>
            <h2 style={{ 
              fontSize: "0.9em",
              color: "#000000",
              fontWeight: "600",
              marginBottom: "12px"
            }}>
              Điện thoại
            </h2>
            <a 
              href="tel:+84123456789" 
              style={{ 
                fontSize: "0.9em",
                color: "#000000",
                textDecoration: "none"
              }}
            >
              0123 456 789
            </a>
          </div>

          <div>
            <h2 style={{ 
              fontSize: "0.9em",
              color: "#000000",
              fontWeight: "600",
              marginBottom: "12px"
            }}>
              Email
            </h2>
            <a 
              href="mailto:contact@aish.com" 
              style={{ 
                fontSize: "0.9em",
                color: "#000000",
                textDecoration: "none"
              }}
            >
              contact@aish.com
            </a>
          </div>
        </div>

        <button
          onClick={() => router.back()}
          style={{
            backgroundColor: "#000000",
            color: "#FFFFFF",
            padding: "14px 24px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "0.8em",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            fontWeight: "600"
          }}
        >
          Quay lại
        </button>
      </div>
    </div>
  );
} 