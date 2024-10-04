import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="grid h-dvh w-dvw place-content-center bg-green-100">
      <div className="flex flex-col items-center space-y-3">
        <Image src={'/BERKANA-LOGO.png'} width={250} height={250} alt="Logo Principal" />
        <h1 className="text-center text-4xl font-extrabold text-primary/85">SISTEMA DE GESTIÓN DE CAJA CHICA</h1>
        <Button variant={"ghost"} className="hover:bg-red-500 hover:text-white">
          <Link href={"/login"}>Iniciar Sesión</Link>
        </Button>
      </div>
    </div>
  );
}
