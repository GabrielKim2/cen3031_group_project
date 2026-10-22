import { useEffect, useState } from "react";

type ApiState<T> =
  | { status: "loading"; data?: undefined; error?: undefined }
  | { status: "success"; data: T; error?: undefined }
  | { status: "error"; data?: undefined; error: Error };

/** Runs an API read when the component mounts or `deps` change. */
export function useApi<T>(
  load: () => Promise<T>,
  deps: unknown[],
): ApiState<T> {
  const [state, setState] = useState<ApiState<T>>({ status: "loading" });

  useEffect(() => {
    let active = true;
    setState({ status: "loading" });
    load().then(
      (data) => active && setState({ status: "success", data }),
      (error: Error) => active && setState({ status: "error", error }),
    );
    return () => {
      active = false;
    };
  }, deps);

  return state;
}
