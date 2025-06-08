// global.d.ts
declare global {
  interface Window {
    ApexCharts: {
      /**
       * Executes a method on a chart instance by its ID.
       * @param chartId The ID of the chart.
       * @param methodName The name of the method to execute (e.g., 'dataURI', 'updateOptions').
       * @param options Optional arguments or options for the method.
       * @returns A promise that resolves with the result of the method execution.
       * For 'dataURI', it typically resolves to an object like { imgURI?: string }.
       */
      exec: (
        chartId: string,
        methodName: string,
        options?: any
      ) => Promise<{ imgURI?: string } | any>; // Adjusted to reflect that 'dataURI' returns a promise
    };
  }
}

// This export {} is important to ensure the file is treated as a module
// and allows global augmentation.
export {};
