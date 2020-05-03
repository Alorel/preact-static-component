Like `memo()`, but never re-renders.

# Installation

Create a `.npmrc` file in your project root and add the following line to it:

```
@alorel:registry=https://npm.pkg.github.com/alorel
```

Then run `npm install @alorel/preact-static-component`

# Usage

```tsx
import {h} from 'preact';
import {staticComponent} from '@alorel/preact-static-component';

function IWillReRender() {
  return (
    <some>
        <deep>
            <static>
              <tree/>
            </static>
        </deep> 
    </some>
  );
}

const IWont = staticComponent(IWillReRender);
```
