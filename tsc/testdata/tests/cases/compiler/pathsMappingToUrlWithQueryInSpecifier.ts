// @noEmit: true
// @filename: /tsconfig.json
{
    "compilerOptions": {
        "noEmit": true,
        "paths": {
            "cdn/*": ["https://example.com/*"]
        }
    }
}
// @filename: /a.ts
import a from "cdn/x?y/z";
import b from "cdn/x#y/z";
