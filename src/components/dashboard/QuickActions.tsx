import { Plus, Building2, Users, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Link to="/imoveis/novo">
        <Button
          variant="outline"
          className="h-auto w-full justify-start gap-3 p-4 hover:border-primary hover:bg-primary/5"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div className="text-left">
            <p className="font-semibold">Cadastrar Imóvel</p>
            <p className="text-xs text-muted-foreground">Novo repasse</p>
          </div>
        </Button>
      </Link>

      <Link to="/clientes/novo">
        <Button
          variant="outline"
          className="h-auto w-full justify-start gap-3 p-4 hover:border-primary hover:bg-primary/5"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-success">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div className="text-left">
            <p className="font-semibold">Cadastrar Cliente</p>
            <p className="text-xs text-muted-foreground">Comprador ou vendedor</p>
          </div>
        </Button>
      </Link>

      <Link to="/imoveis">
        <Button
          variant="outline"
          className="h-auto w-full justify-start gap-3 p-4 hover:border-primary hover:bg-primary/5"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
            <Search className="h-5 w-5 text-secondary-foreground" />
          </div>
          <div className="text-left">
            <p className="font-semibold">Buscar Imóveis</p>
            <p className="text-xs text-muted-foreground">Filtrar por região</p>
          </div>
        </Button>
      </Link>

      <Link to="/matches">
        <Button
          variant="outline"
          className="h-auto w-full justify-start gap-3 p-4 hover:border-accent hover:bg-accent/5"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-accent">
            <Plus className="h-5 w-5 text-accent-foreground" />
          </div>
          <div className="text-left">
            <p className="font-semibold">Ver Matches</p>
            <p className="text-xs text-muted-foreground">3 novas oportunidades</p>
          </div>
        </Button>
      </Link>
    </div>
  );
}
