export interface CallSequence {
  message: string;
  status: STATUS;
  level: number;
  subCalls?: CallSequence[];
}

export type STATUS = 'loading' | 'pending others' | 'done';
