import * as CSS from 'csstype';

declare module 'csstype' {
  interface Properties {
    '--order'?: string | number;
    '--destTop'?: string | number;
    '--destLeft'?: string | number;
  }
}
