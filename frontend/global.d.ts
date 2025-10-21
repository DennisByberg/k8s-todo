// global.d.ts

// This declaration tells TypeScript that any file ending in '.css'
// can be imported and should be treated as a valid module.
declare module '*.css' {
  // Since CSS imports are side-effect only (they don't export a value
  // you typically use), we can just declare an empty object or define the module.
  // The 'any' type is generally acceptable here, or you can leave it empty.
  const content: Record<string, string>;
  export default content;
}

// If you are using CSS Modules (e.g., files named *.module.css)
// you'll need a separate, slightly different declaration:
declare module '*.module.css' {
  // CSS Modules export a map of class names to their hashed equivalents.
  // The type of this export is a record where keys are strings (class names)
  // and values are strings (hashed class names).
  const classes: Record<string, string>;
  export default classes;
}
