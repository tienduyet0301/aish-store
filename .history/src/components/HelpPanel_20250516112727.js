import { motion, AnimatePresence } from 'framer-motion';

export default function HelpPanel({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 backdrop-blur-sm bg-black/25 z-40"
          />
          
          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 w-1/2 h-full bg-white z-50 overflow-y-auto"
          >
            <div className="relative p-12">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-8 right-8 text-black hover:opacity-70"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              <h2 style={{ 
                fontSize: "1.2em",
                color: "#000000",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "32px",
                fontWeight: "600",
                textAlign: "center"
              }}>
                CONTACT US
              </h2>

              <div className="space-y-8">
                {/* Call section */}
                <div className="flex flex-col space-y-1">
                  <div className="flex items-start space-x-6 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex-shrink-0">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <h3 style={{
                        fontSize: "0.9em",
                        color: "#000000",
                        fontWeight: "600",
                        marginBottom: "4px",
                        textTransform: "uppercase"
                      }}>
                        CALL US
                      </h3>
                      <a 
                        href="tel:+84123456789"
                        style={{ 
                          fontSize: "0.85em",
                          color: "#666666",
                          textDecoration: "none"
                        }}
                      >
                        0347272386
                      </a>
                    </div>
                  </div>
                  <div style={{
                    padding: "8px 12px",
                    backgroundColor: "#f9f9f9",
                    borderRadius: "8px",
                    fontSize: "0.8em",
                    color: "#666666",
                    marginLeft: "46px"
                  }}>
                    <p>Quý khách vui lòng liên lạc trong giờ hành chính để được phản hồi và hỗ trợ sớm nhất nhaaa</p>
                  </div>
                </div>

                {/* Facebook section */}
                <div className="flex flex-col space-y-1">
                  <div className="flex items-start space-x-6 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex-shrink-0">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3V2z" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <h3 style={{
                        fontSize: "0.9em",
                        color: "#000000",
                        fontWeight: "600",
                        marginBottom: "4px",
                        textTransform: "uppercase"
                      }}>
                        FACEBOOK
                      </h3>
                      <a 
                        href="https://www.facebook.com/profile.php?id=61564602818212"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ 
                          fontSize: "0.85em",
                          color: "#666666",
                          textDecoration: "none"
                        }}
                      >
                        @aish.official
                      </a>
                    </div>
                  </div>
                  <div style={{
                    padding: "8px 12px",
                    backgroundColor: "#f9f9f9",
                    borderRadius: "8px",
                    fontSize: "0.8em",
                    color: "#666666",
                    marginLeft: "46px"
                  }}>
                    <p>Quý khách vui lòng liên lạc trong giờ hành chính để được phản hồi và hỗ trợ sớm nhất nhaaa

</p>
                  </div>
                </div>

                {/* Instagram section */}
                <div className="flex flex-col space-y-1">
                  <div className="flex items-start space-x-6 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex-shrink-0">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="2" y="2" width="20" height="20" rx="5" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <h3 style={{
                        fontSize: "0.9em",
                        color: "#000000",
                        fontWeight: "600",
                        marginBottom: "4px",
                        textTransform: "uppercase"
                      }}>
                        INSTAGRAM
                      </h3>
                      <a 
                        href="https://instagram.com/aish"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ 
                          fontSize: "0.85em",
                          color: "#666666",
                          textDecoration: "none"
                        }}
                      >
                        @aish.official
                      </a>
                    </div>
                  </div>
                  <div style={{
                    padding: "8px 12px",
                    backgroundColor: "#f9f9f9",
                    borderRadius: "8px",
                    fontSize: "0.8em",
                    color: "#666666",
                    marginLeft: "46px"
                  }}>
                    <p>Quý khách vui lòng liên lạc trong giờ hành chính để được phản hồi và hỗ trợ sớm nhất nhaaa

</p>
                  </div>
                </div>
              </div>

              {/* Further assistance section */}
              <div style={{
                marginTop: "32px",
                textAlign: "left",
                padding: "16px 0"
              }}>
                <p style={{
                  fontSize: "0.85em",
                  color: "#666666",
                  fontWeight: "500",
                  marginLeft: "46px"
                }}>
                  Do you need further assistance?
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 