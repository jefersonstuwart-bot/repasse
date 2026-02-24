import * as React from "react";
import { cn } from "@/lib/utils";

interface CurrencyInputProps extends Omit<React.ComponentProps<"input">, "onChange" | "value"> {
  value: number | null;
  onChange: (value: number | null) => void;
}

// Formata o valor para exibição (160000 -> 160.000,00)
export function formatCurrencyDisplay(value: number | string): string {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(numValue)) return "";
  
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numValue);
}

// Converte o valor formatado para número (160.000,00 -> 160000)
export function parseCurrencyValue(formattedValue: string): number | null {
  // Remove tudo exceto números e vírgula
  const cleanValue = formattedValue.replace(/[^\d,]/g, "");
  if (!cleanValue) return null;
  // Troca vírgula por ponto para converter
  const numericString = cleanValue.replace(",", ".");
  const numericValue = parseFloat(numericString);
  return isNaN(numericValue) ? null : numericValue;
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value, onChange, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState("");

    // Sincroniza o displayValue quando o value externo muda
    React.useEffect(() => {
      if (value !== null && value !== undefined) {
        setDisplayValue(formatCurrencyDisplay(value));
      } else {
        setDisplayValue("");
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let inputValue = e.target.value;
      
      // Remove tudo exceto números e vírgula
      inputValue = inputValue.replace(/[^\d,]/g, "");
      
      // Garante apenas uma vírgula
      const commaIndex = inputValue.indexOf(",");
      if (commaIndex !== -1) {
        const before = inputValue.substring(0, commaIndex);
        const after = inputValue.substring(commaIndex + 1).replace(/,/g, "");
        inputValue = before + "," + after.substring(0, 2);
      }
      
      setDisplayValue(inputValue);
      
      // Converte para valor numérico para armazenar
      const numericValue = parseCurrencyValue(inputValue);
      onChange(numericValue);
    };

    const handleBlur = () => {
      // Ao sair do campo, formata completamente
      if (value !== null && value !== undefined) {
        setDisplayValue(formatCurrencyDisplay(value));
      }
    };

    return (
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
        <input
          type="text"
          inputMode="decimal"
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            className,
          )}
          ref={ref}
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="0,00"
          {...props}
        />
      </div>
    );
  },
);
CurrencyInput.displayName = "CurrencyInput";

export { CurrencyInput };
