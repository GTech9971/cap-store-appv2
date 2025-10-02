import type { Preview } from '@storybook/react-vite'

import '@ionic/react/css/core.css';
import { setupIonicReact, IonApp } from '@ionic/react';
import { MemoryRouter } from 'react-router-dom';
import { initialize, mswLoader } from 'msw-storybook-addon';
import { handlers } from './mocks/handlers';

initialize();

setupIonicReact({
  mode: 'ios'
});

const preview: Preview = {
  decorators: [
    (Story) => (
      <IonApp>
        <MemoryRouter>
          <Story />
        </MemoryRouter>
      </IonApp>
    )
  ],
  loaders: [mswLoader],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    msw: {
      // 全てのストーリーに適用
      handlers: handlers
    }
  },
};

export default preview;