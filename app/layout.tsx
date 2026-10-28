import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {title:"Net Defterim · YKS ders çalışma programı", description:"Okul, dershane ve spor saatlerine göre kişisel YKS ders çalışma programı; Maarif TYT kampı, alarm, yanlış defteri, aralıklı tekrar ve aylık rapor.", icons:{icon:"/favicon.png",shortcut:"/favicon.png",apple:"/apple-touch-icon.png"},manifest:"/manifest.webmanifest",appleWebApp:{capable:true,statusBarStyle:"default",title:"Net Defterim"}};
export const viewport={themeColor:"#086d64",width:"device-width",initialScale:1,viewportFit:"cover" as const};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="tr"><body>{children}</body></html>}
