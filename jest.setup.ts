process.env.EXPO_PUBLIC_API_URL = 'http://127.0.0.1:9191';
process.env.EXPO_PUBLIC_WS_URL = 'ws://127.0.0.1:9191';
process.env.EXPO_PUBLIC_APP_ENV = 'development';
process.env.EXPO_PUBLIC_OPERATOR_ID = 'transavold';
process.env.EXPO_PUBLIC_DEPOT_ID = 'fluo57';

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
    SafeAreaView: View,
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  };
});

jest.mock('expo-router', () => {
  const React = require('react');
  const push = jest.fn();
  const replace = jest.fn();
  const back = jest.fn();
  return {
    useRouter: () => ({ push, replace, back }),
    useLocalSearchParams: () =>
      (global as { __routeParams?: Record<string, string> }).__routeParams ?? {},
    useSegments: () => [],
    usePathname: () => '/',
    Redirect: ({ href }: { href: string }) => {
      React.useEffect(() => {
        replace(href);
      }, [href]);
      return null;
    },
    Stack: Object.assign(() => null, { Screen: () => null }),
    Link: ({ children }: { children: React.ReactNode }) => children,
    __router: { push, replace, back },
  };
});

jest.mock('expo-font', () => ({
  useFonts: jest.fn(() => [true, null]),
}));

jest.mock('@shopify/flash-list', () => {
  const { FlatList } = require('react-native');
  return { FlashList: FlatList };
});

jest.mock('expo-location', () => ({
  Accuracy: { High: 4 },
  requestForegroundPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  watchPositionAsync: jest.fn(async () => ({ remove: jest.fn() })),
}));

jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');
  const Mock = (props: { children?: React.ReactNode; testID?: string }) =>
    React.createElement(View, { testID: props.testID ?? 'svg-mock' }, props.children);
  return {
    __esModule: true,
    default: Mock,
    Svg: Mock,
    Circle: Mock,
    Ellipse: Mock,
    Rect: Mock,
    Path: Mock,
    Line: Mock,
    G: Mock,
  };
});

jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');
  const Mock = (props: { children?: React.ReactNode }) =>
    React.createElement(View, { testID: 'map-view' }, props.children);
  return {
    __esModule: true,
    default: Mock,
    Marker: Mock,
    Polyline: Mock,
    Circle: Mock,
    PROVIDER_DEFAULT: 'default',
  };
});
