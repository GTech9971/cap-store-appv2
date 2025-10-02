# cap-store-appv2

## msw

```bash
npm i msw --save-dev
```

```bash
npx msw init public
```

## storybook

### msw

```bash
npm install msw-storybook-addon --save-dev
```

.storybook/preview.ts

```ts
import { initialize, mswLoader } from 'msw-storybook-addon';

initialize();

const preview: Preview = {
  ...
  loaders: [mswLoader],
  ...
};
```

.storybook/main.ts

```ts
const config: StorybookConfig = {
  ...
  "staticDirs": ["../public"]
};
```

handlersの記載

#### 全てのストーリーに適用

.storybook\preview.ts

```ts
const preview: Preview = {
  ...
  parameters: {
   ...
    msw: {
      // 全てのストーリーに適用
      handlers: handlers
    }
  },
};
```

#### ストーリーレベル

```ts
export const Default: Story = {
  parameters: {
    msw: {
      handlers: [
        rest.get("/api/xxxxx", async (_, res, ctx) => {
          return res(ctx.status(401));
        })
      ]
    }
  }
}
```
