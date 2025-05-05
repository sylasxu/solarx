import Theme from 'rspress/theme';
import Nav from './Nav' 
const Layout = () => <Theme.Layout 
afterFeatures={<div>afterFeatures</div>}/>;

export default {
  ...Theme,
  Layout,
  Nav
};

export * from 'rspress/theme';