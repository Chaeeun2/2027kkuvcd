import { useCallback, useEffect, useState } from "react";
import { getDefaultWorkCategoryLabelMap } from "../../data/workCategoryLabels";
import { loadWorkCategoryLabelMap } from "../../content/workCategoriesContent";

function useWorkCategoryLabelMap() {
  const [labelMap, setLabelMap] = useState(getDefaultWorkCategoryLabelMap());
  const [status, setStatus] = useState("loading");

  const reload = useCallback(() => {
    setStatus("loading");
    return loadWorkCategoryLabelMap()
      .then((next) => {
        setLabelMap(next);
        setStatus("ready");
      })
      .catch(() => {
        setLabelMap(getDefaultWorkCategoryLabelMap());
        setStatus("error");
      });
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { labelMap, reload, status };
}

export default useWorkCategoryLabelMap;
