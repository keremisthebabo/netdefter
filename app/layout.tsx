import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {title:"Yusuf Kaya · Net Defterim · YKS 2028", description:"Yusuf Kaya'nın deneme yanlışları, soru çözümleri, aralıklı tekrar takvimi ve aylık raporu.", icons:{icon:"/favicon.png",shortcut:"/favicon.png",apple:"/apple-touch-icon.png"},manifest:"/manifest.webmanifest",appleWebApp:{capable:true,statusBarStyle:"default",title:"Net Defterim"}};
export const viewport={themeColor:"#086d64",width:"device-width",initialScale:1,viewportFit:"cover" as const};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="tr"><body>{children}</body></html>}
