/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

test('renders correctly', async () => {
  let app: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    app = ReactTestRenderer.create(<App />);
  });

  await ReactTestRenderer.act(() => {
    app!.unmount();
  });
});
