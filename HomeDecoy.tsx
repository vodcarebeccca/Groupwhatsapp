import React from 'react';
import { WALogo } from './WhatsAppIcons';
import { MoreVertical, Settings } from 'lucide-react';

const HomeDecoy: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#d1d7db] font-sans relative flex flex-col items-center overflow-hidden">
      {/* Green Top Strip */}
      <div className="absolute top-0 left-0 right-0 h-[220px] bg-[#00a884] z-0">
        <div className="max-w-[1050px] mx-auto px-4 h-full flex items-start pt-7 text-white gap-3">
           <div className="flex items-center gap-2">
             <svg viewBox="0 0 33 33" width="33" height="33" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.6 0C7.4 0 0 7.4 0 16.5C0 19.5 0.8 22.3 2.2 24.8L0.6 30.6C0.5 31.1 0.9 31.5 1.4 31.4L7.3 29.8C9.7 31.2 12.6 32 15.6 32H15.7C24.9 31.9 32.3 24.5 32.3 15.4C32.3 6.3 24.8 0 16.6 0ZM16.6 29.2C13.9 29.2 11.3 28.5 9.1 27.2L8.5 26.8L3.3 28.2L4.7 23.1L4.3 22.5C2.9 20.1 2.2 17.4 2.2 15.4C2.3 7.5 8.7 1.1 16.6 1.1C24.5 1.1 30.1 7.5 30.1 15.4C30.1 23.3 23.7 29.2 16.6 29.2Z" fill="white"/>
                <path d="M25.3 20.8C24.9 20.6 22.8 19.6 22.4 19.5C22 19.4 21.7 19.3 21.4 19.8C21.1 20.3 20.2 21.3 20 21.6C19.7 21.9 19.4 21.9 19 21.7C18.6 21.5 17.3 21.1 15.8 19.7C14.6 18.7 13.8 17.4 13.5 16.9C13.2 16.4 13.5 16.1 13.7 15.9C13.9 15.7 14.2 15.4 14.4 15.1C14.6 14.8 14.7 14.6 14.9 14.3C15 14 14.9 13.7 14.8 13.5C14.7 13.3 13.8 11.2 13.5 10.3C13.1 9.4 12.7 9.5 12.4 9.5C12.2 9.5 11.9 9.5 11.6 9.5C11.3 9.5 10.9 9.6 10.5 10C10.1 10.4 9 11.5 9 13.7C9 15.9 10.6 18 10.8 18.3C11 18.6 13.9 23.1 18.4 25C19.5 25.5 20.3 25.8 21 26C22 26.3 22.9 26.3 23.6 26.2C24.4 26.1 26 25.2 26.4 24.2C26.7 23.2 26.7 22.3 26.6 22.1C26.5 22 26.2 21.9 25.8 21.7L25.3 20.8Z" fill="white"/>
             </svg>
             <span className="uppercase font-semibold text-sm tracking-wide">WhatsApp Web</span>
           </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="z-10 w-full max-w-[1050px] px-4 mt-28">
        <div className="bg-white rounded-[3px] shadow-lg flex flex-col md:flex-row h-[70vh] min-h-[550px] overflow-hidden">
          
          {/* Instructions */}
          <div className="p-10 md:p-14 md:w-[65%] flex flex-col">
            <h1 className="text-[28px] font-light text-[#41525d] mb-10">Use WhatsApp on your computer</h1>
            <ol className="list-decimal list-inside space-y-5 text-[18px] text-[#3b4a54] leading-8">
              <li>Open WhatsApp on your phone</li>
              <li>Tap <strong>Menu</strong> <MoreVertical className="inline w-4 h-4 align-middle" /> or <strong>Settings</strong> <Settings className="inline w-4 h-4 align-middle" /> and select <strong>Linked Devices</strong></li>
              <li>Tap on <strong>Link a Device</strong></li>
              <li>Point your phone to this screen to capture the code</li>
            </ol>
            <div className="mt-12 text-[#008069] font-medium hover:underline cursor-pointer text-[15px]">
              Need help to get started?
            </div>
          </div>

          {/* QR Code Section */}
          <div className="md:w-[35%] flex items-center justify-center border-l border-gray-100 p-8 relative">
            <div className="relative">
               <img 
                 src="https://api.qrserver.com/v1/create-qr-code/?size=264x264&data=https://whatsapp.com" 
                 alt="Scan me" 
                 className="w-[264px] h-[264px] opacity-90"
               />
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white p-2 rounded-full shadow-sm">
                    <svg viewBox="0 0 33 33" width="40" height="40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16.6 0C7.4 0 0 7.4 0 16.5C0 19.5 0.8 22.3 2.2 24.8L0.6 30.6C0.5 31.1 0.9 31.5 1.4 31.4L7.3 29.8C9.7 31.2 12.6 32 15.6 32H15.7C24.9 31.9 32.3 24.5 32.3 15.4C32.3 6.3 24.8 0 16.6 0ZM16.6 29.2C13.9 29.2 11.3 28.5 9.1 27.2L8.5 26.8L3.3 28.2L4.7 23.1L4.3 22.5C2.9 20.1 2.2 17.4 2.2 15.4C2.3 7.5 8.7 1.1 16.6 1.1C24.5 1.1 30.1 7.5 30.1 15.4C30.1 23.3 23.7 29.2 16.6 29.2Z" fill="#25D366"/>
                        <path d="M25.3 20.8C24.9 20.6 22.8 19.6 22.4 19.5C22 19.4 21.7 19.3 21.4 19.8C21.1 20.3 20.2 21.3 20 21.6C19.7 21.9 19.4 21.9 19 21.7C18.6 21.5 17.3 21.1 15.8 19.7C14.6 18.7 13.8 17.4 13.5 16.9C13.2 16.4 13.5 16.1 13.7 15.9C13.9 15.7 14.2 15.4 14.4 15.1C14.6 14.8 14.7 14.6 14.9 14.3C15 14 14.9 13.7 14.8 13.5C14.7 13.3 13.8 11.2 13.5 10.3C13.1 9.4 12.7 9.5 12.4 9.5C12.2 9.5 11.9 9.5 11.6 9.5C11.3 9.5 10.9 9.6 10.5 10C10.1 10.4 9 11.5 9 13.7C9 15.9 10.6 18 10.8 18.3C11 18.6 13.9 23.1 18.4 25C19.5 25.5 20.3 25.8 21 26C22 26.3 22.9 26.3 23.6 26.2C24.4 26.1 26 25.2 26.4 24.2C26.7 23.2 26.7 22.3 26.6 22.1C26.5 22 26.2 21.9 25.8 21.7L25.3 20.8Z" fill="white"/>
                    </svg>
                  </div>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HomeDecoy;