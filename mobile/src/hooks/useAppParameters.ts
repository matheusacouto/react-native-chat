import { useEffect, useMemo, useState } from "react";
import { AppParameterModel } from "@/src/models/app-parameter";
import { getActiveAppParameters } from "@/src/services/api/app-parameters.service";

export function useAppParameters() {
  const [parameters, setParameters] = useState<AppParameterModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadParameters() {
      try {
        const data = await getActiveAppParameters();
        setParameters(data);
      } catch {
        setParameters([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadParameters();
  }, []);

  const parameterMap = useMemo(
    () =>
      parameters.reduce<Record<string, string>>((accumulator, parameter) => {
        accumulator[parameter.chave] = parameter.valor;
        return accumulator;
      }, {}),
    [parameters],
  );

  return {
    parameters,
    parameterMap,
    isLoading,
  };
}
