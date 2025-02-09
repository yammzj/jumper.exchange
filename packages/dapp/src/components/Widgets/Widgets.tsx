import { WidgetSubvariant } from '@lifi/widget';
import { Grid, useTheme } from '@mui/material';
import { TestnetAlert } from '@transferto/shared/src';
import {
  MouseEventHandler,
  useCallback,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { TrackingAction, TrackingCategory } from '../../const';
import { TabsMap } from '../../const/tabsMap';
import { useUserTracking } from '../../hooks';
import { useActiveTabStore, useSettingsStore } from '../../stores';
import { EventTrackingTool, LinkMap, StarterVariantType } from '../../types';
import { OnRamper } from '../OnRamper';
import { WelcomeWrapper } from '../WelcomeWrapper';
import { Widget } from '../Widget';
import { WidgetEvents } from './WidgetEvents';
import { WidgetContainer } from './Widgets.style';

export function Widgets() {
  const { activeTab, setActiveTab } = useActiveTabStore();
  const [welcomeScreenClosed, onWelcomeScreenClosed] = useSettingsStore(
    (state) => [state.welcomeScreenClosed, state.onWelcomeScreenClosed],
  );
  const theme = useTheme();
  const { trackEvent } = useUserTracking();
  const [starterVariantUsed, setStarterVariantUsed] = useState(false);
  const [_starterVariant, setStarterVariant] = useState<
    WidgetSubvariant | 'buy'
  >(TabsMap.Exchange.variant);

  const starterVariant: StarterVariantType = useMemo(() => {
    let url = window.location.pathname.slice(1);
    if (Object.values(LinkMap).includes(url as LinkMap)) {
      if (!!TabsMap.Buy.destination.filter((el) => el === url).length) {
        return TabsMap.Buy.variant;
      } else if (
        !!TabsMap.Refuel.destination.filter((el) => el === url).length
      ) {
        return TabsMap.Refuel.variant;
      } else {
        return TabsMap.Exchange.variant;
      }
    } else {
      // default and fallback: Exchange-Tab
      return TabsMap.Exchange.variant;
    }
  }, []);

  const getActiveWidget = useCallback(() => {
    if (!starterVariantUsed) {
      switch (starterVariant) {
        case TabsMap.Exchange.variant:
          setActiveTab(TabsMap.Exchange.index);
          break;
        case TabsMap.Refuel.variant:
          setActiveTab(TabsMap.Refuel.index);
          break;
        case TabsMap.Buy.variant:
          setActiveTab(TabsMap.Buy.index);
          break;
        default:
          setActiveTab(TabsMap.Exchange.index);
      }
      setStarterVariant(starterVariant);
      setStarterVariantUsed(true);
    } else {
      switch (activeTab) {
        case TabsMap.Exchange.index:
          setStarterVariant(TabsMap.Exchange.variant);
          break;
        case TabsMap.Refuel.index:
          setStarterVariant(TabsMap.Refuel.variant);
          break;
        case TabsMap.Buy.index:
          setStarterVariant(TabsMap.Buy.variant);
          break;
        default:
          setStarterVariant(TabsMap.Exchange.variant);
      }
    }
  }, [activeTab, setActiveTab, starterVariant, starterVariantUsed]);

  const handleGetStarted: MouseEventHandler<HTMLDivElement> = (event) => {
    const classList = (event.target as HTMLElement).classList;
    if (
      classList.contains?.('stats-card') ||
      classList.contains?.('link-lifi')
    ) {
      return;
    } else {
      event.stopPropagation();
      onWelcomeScreenClosed(true);
      trackEvent({
        category: TrackingCategory.WelcomeScreen,
        action: TrackingAction.CloseWelcomeScreen,
        label: 'enter_welcome_screen',
        disableTrackingTool: [EventTrackingTool.ARCx, EventTrackingTool.Raleon],
      });
    }
  };

  useLayoutEffect(() => {
    getActiveWidget();
  }, [getActiveWidget, starterVariant, activeTab]);

  return (
    <WelcomeWrapper
      showWelcome={!welcomeScreenClosed}
      handleGetStarted={handleGetStarted}
    >
      {import.meta.env.MODE === 'testnet' && (
        <Grid item xs={12} mt={theme.spacing(3)}>
          <TestnetAlert />
        </Grid>
      )}
      <WidgetContainer
        onClick={!welcomeScreenClosed ? handleGetStarted : undefined}
        showWelcome={!welcomeScreenClosed}
        isActive={_starterVariant === TabsMap.Exchange.variant}
      >
        <Widget starterVariant={TabsMap.Exchange.variant as WidgetSubvariant} />
      </WidgetContainer>
      <WidgetContainer
        onClick={!welcomeScreenClosed ? handleGetStarted : undefined}
        showWelcome={!welcomeScreenClosed}
        isActive={_starterVariant === TabsMap.Refuel.variant}
      >
        <Widget starterVariant={TabsMap.Refuel.variant as WidgetSubvariant} />
      </WidgetContainer>
      {import.meta.env.VITE_ONRAMPER_ENABLED ? (
        <WidgetContainer
          onClick={!welcomeScreenClosed ? handleGetStarted : undefined}
          showWelcome={!welcomeScreenClosed}
          isActive={_starterVariant === TabsMap.Buy.variant}
          sx={{ width: '392px' }}
        >
          <div className="onramper-wrapper">
            <OnRamper />
          </div>
        </WidgetContainer>
      ) : null}
      <WidgetEvents />
    </WelcomeWrapper>
  );
}
