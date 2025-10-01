import type { Preview } from '@storybook/react-vite'

import '@ionic/react/css/core.css';
import { setupIonicReact, IonApp } from '@ionic/react';
import { MemoryRouter } from 'react-router-dom';

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
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;