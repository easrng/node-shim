# \@easrng/node-shim

shim node modules with process.getBuiltinModule

## Usage

just rewrite `node:*` imports to `npm:@easrng/node-shim/*`. this is not a
polyfill! importing these modules will still throw at runtime in browsers, but
everything should work as expected in deno and node.
