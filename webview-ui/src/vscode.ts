// defining a custom type to ensure the type-safe postMessage method
type VsCode = {
  postMessage: (message: any) => void;
};
declare function acquireVsCodeApi(): VsCode;

const vscode: VsCode = acquireVsCodeApi();

export default vscode;