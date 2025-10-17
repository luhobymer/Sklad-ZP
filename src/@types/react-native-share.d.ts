declare module 'react-native-share' {
  export interface ShareOptions {
    title?: string;
    message?: string;
    url?: string;
    urls?: string[];
    type?: string;
    subject?: string;
    excludedActivityTypes?: string[];
    failOnCancel?: boolean;
    showAppsToView?: boolean;
    filename?: string;
    saveToFiles?: boolean;
  }

  export interface ShareResponse {
    success: boolean;
    message?: string;
  }

  export interface ShareSingleOptions extends ShareOptions {
    social: string;
  }

  const Sharing: {
    open: (options: ShareOptions) => Promise<ShareResponse>;
    shareSingle: (options: ShareSingleOptions) => Promise<ShareResponse>;
    isPackageInstalled: (packageName: string) => Promise<boolean>;
  };

  export default Sharing;
}