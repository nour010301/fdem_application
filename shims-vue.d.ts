// shims-css.d.ts (or shims-vue.d.ts if you don't have one yet)
declare module '*.css' {
    const content: any;
    export default content;
  }
  