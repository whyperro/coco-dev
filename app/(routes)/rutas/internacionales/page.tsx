"use client";

import { useGetRoutes } from '@/actions/routes/actions';
import { ContentLayout } from '@/components/sidebar/ContentLayout';
import { Route } from '@/types';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { columns } from './columns';
import { DataTable } from './data-table';

const BranchPage = () => {
  const [filteredRoutes, setFilteredRoutes] = useState<Route[]>([])
  const { data: routes, loading, error } = useGetRoutes();


  useEffect(() => {
    if (routes) {
      const r = routes.filter((route) => route.route_type === 'INTERNACIONAL')
      setFilteredRoutes(r)
    }
  }, [routes])

  return (
    <ContentLayout title="Clientes">
      <div className="relative text-center mt-6 space-y-3">
        {/* Contenedor de la imagen con posición absoluta y z-index bajo */}
        <div className="absolute inset-0 flex justify-center items-center mt-6 ">
          <Image
            src={'/international-flag.jpg'}
            width={230}
            height={230}
            className="opacity-25 z-0 mb-12 rounded-full" // Asegura que esté en el fondo
            alt="bandera"
          />
        </div>

        {/* Texto centrado con z-index más alto */}
        <div className="relative z-10">
          <h1 className="text-5xl font-bold">Vuelos Internacionales</h1>
          <p className="mt-2 text-muted-foreground italic text-sm">
            Aquí puede ver el listado de los vuelos <strong>Internacional</strong> registrados.
          </p>
        </div>
      </div>

      {loading && (
        <div className="w-full flex justify-center">
          <Loader2 className="size-12 animate-spin" />
        </div>
      )}

      {filteredRoutes && <DataTable columns={columns} data={filteredRoutes} />}

      {error && (
        <div className="w-full flex justify-center text-sm text-muted-foreground">
          Hubo un error cargando las rutas...
        </div>
      )}
    </ContentLayout>
  );
};

export default BranchPage;
