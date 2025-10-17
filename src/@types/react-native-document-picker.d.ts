declare module 'react-native-document-picker' {
  export interface DocumentPickerOptions {
    type?: string | string[];
    mode?: 'import' | 'open';
    copyTo?: 'cachesDirectory' | 'documentDirectory';
    allowMultiSelection?: boolean;
    presentationStyle?: 'fullScreen' | 'pageSheet' | 'formSheet' | 'overFullScreen';
    transitionStyle?: 'coverVertical' | 'flipHorizontal' | 'crossDissolve' | 'partialCurl';
  }

  export interface DocumentPickerResponse {
    uri: string;
    type: string | null;
    name: string | null;
    size: number | null;
    fileCopyUri?: string | null;
  }

  export namespace types {
    export const allFiles: string;
    export const images: string;
    export const plainText: string;
    export const audio: string;
    export const pdf: string;
    export const zip: string;
    export const csv: string;
    export const doc: string;
    export const docx: string;
    export const ppt: string;
    export const pptx: string;
    export const xls: string;
    export const xlsx: string;
  }

  export function pick(options?: DocumentPickerOptions): Promise<DocumentPickerResponse[]>;
  export function pickSingle(options?: DocumentPickerOptions): Promise<DocumentPickerResponse>;
  export function pickMultiple(options?: DocumentPickerOptions): Promise<DocumentPickerResponse[]>;
  export function releaseSecureAccess(uris: string[]): Promise<void>;
  export function isCancel(error: any): boolean;
  export function isInProgress(error: any): boolean;

  const DocumentPicker: {
    pick: typeof pick;
    pickSingle: typeof pickSingle;
    pickMultiple: typeof pickMultiple;
    releaseSecureAccess: typeof releaseSecureAccess;
    isCancel: typeof isCancel;
    isInProgress: typeof isInProgress;
    types: typeof types;
  };

  export default DocumentPicker;
}