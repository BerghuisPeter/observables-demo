export class CallSequence {
  message: string = '';
  status: STATUS = 'init';
  subCalls?: CallSequence[] = [];

  constructor(message?: string) {
    if (message) {
      this.message = message;
    }
  }

  getStatusIcon(): string {
    let icon = '';
    switch (this.status) {
      case 'init':
        icon = 'trending_flat';
        break;
      case 'loading':
        icon = 'sync';
        break;
      case 'done':
        icon = 'done';
        break;
      case 'error':
        icon = 'close';
        break;
    }
    return icon;
  }
}

export type STATUS = 'init' | 'loading' | 'pending others' | 'done' | 'error';
