import React, { memo, useCallback, useMemo } from 'react';
import type { TooltipProps } from 'recharts';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { VaultEntity } from '../../../../data/entities/vault';
import type { TokenEntity } from '../../../../data/entities/token';
import type { ChartStat } from '../../../../data/reducers/historical-types';
import type { ApiTimeBucket } from '../../../../data/apis/beefy/beefy-data-api-types';
import { makeStyles, useMediaQuery } from '@material-ui/core';
import type { Theme } from '@material-ui/core';
import { format, fromUnixTime } from 'date-fns';
import { XAxisTick } from '../../../../../components/XAxisTick';
import { getXInterval, mapRangeToTicks } from '../../../../../helpers/graph';
import {
  formatLargePercent,
  formatLargeUsd,
  formatTokenDisplayCondensed,
} from '../../../../../helpers/format';
import type { LineTogglesState } from '../LineToggles';
import { TooltipContent } from '../TooltipContent';
import { useChartData } from './useChartData';
import { styles } from './styles';
import { useAppSelector } from '../../../../../store';
import { selectCowVaultById, selectVaultById } from '../../../../data/selectors/vaults';
import { useTranslation } from 'react-i18next';
import { selectCurrentCowcentratedRangesByVaultId } from '../../../../data/selectors/tokens';
import clsx from 'clsx';

const useStyles = makeStyles(styles);

export type ChartProp = {
  vaultId: VaultEntity['id'];
  oracleId: TokenEntity['oracleId'];
  stat: Omit<ChartStat, 'cowcentrated'>;
  bucket: ApiTimeBucket;
  toggles: LineTogglesState;
};
export const Graph = memo<ChartProp>(function Graph({ vaultId, oracleId, stat, bucket, toggles }) {
  const classes = useStyles();
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('xs'), { noSsr: true });
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const vaultType = vault.type;
  const { min, max, avg, data } = useChartData(stat, vaultId, oracleId, bucket);

  const chartMargin = useMemo(() => {
    return { top: 14, right: isMobile ? 16 : 24, bottom: 0, left: isMobile ? 16 : 24 };
  }, [isMobile]);
  const xTickFormatter = useMemo(() => {
    return (value: number) => formatDateTimeTick(value, bucket);
  }, [bucket]);
  const xTickInterval = useMemo(() => {
    return getXInterval(data.length, isMobile);
  }, [data.length, isMobile]);
  const yTickFormatter = useMemo(() => {
    return stat === 'apy'
      ? (value: number) => formatLargePercent(value)
      : (value: number) => formatLargeUsd(value);
  }, [stat]);
  const yDomain = useMemo(() => {
    return [min, max];
  }, [min, max]);
  const yTicks = useMemo(() => {
    return mapRangeToTicks(min, max);
  }, [min, max]);
  const tooltipContentCreator = useCallback(
    (props: TooltipProps<number, string>) => (
      <TooltipContent
        {...props}
        stat={stat}
        bucket={bucket}
        toggles={toggles}
        valueFormatter={yTickFormatter}
        avg={avg}
        vaultType={vaultType}
      />
    ),
    [stat, bucket, toggles, yTickFormatter, avg, vaultType]
  );

  return (
    <div className={classes.chartContainer}>
      <ResponsiveContainer height={200}>
        <AreaChart data={data} className={classes.graph} height={200} margin={chartMargin}>
          <CartesianGrid strokeDasharray="2 2" stroke="#363B63" />
          <XAxis
            dataKey="t"
            tickMargin={10}
            tickFormatter={xTickFormatter}
            interval={xTickInterval}
            stroke="#363B63"
            tick={XAxisTick}
            padding="no-gap"
          />
          <Area
            dataKey="v"
            stroke="#F5F5FF"
            strokeWidth={1.5}
            fill="rgba(255, 255, 255, 0.05)"
            fillOpacity={100}
          />
          <Tooltip content={tooltipContentCreator} wrapperStyle={{ outline: 'none' }} />
          {toggles.movingAverage ? (
            <Area dataKey="ma" stroke="#5C70D6" strokeWidth={1.5} fill="none" />
          ) : null}
          {toggles.average ? (
            <ReferenceLine y={avg} stroke="#4DB258" strokeWidth={1.5} strokeDasharray="3 3" />
          ) : null}
          <YAxis
            dataKey="v"
            tickFormatter={yTickFormatter}
            domain={yDomain}
            mirror={true}
            stroke="#363B63"
            ticks={yTicks}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
});

export const CowcentratedChart = memo(function CowcentratedChart({
  vaultId,
}: {
  vaultId: VaultEntity['id'];
}) {
  const classes = useStyles();
  const { t } = useTranslation();
  const { currentPrice, priceRangeMin, priceRangeMax } = useAppSelector(state =>
    selectCurrentCowcentratedRangesByVaultId(state, vaultId)
  );

  const vault = useAppSelector(state => selectCowVaultById(state, vaultId));
  const priceString = `${vault.assetIds[1]}/${vault.assetIds[0]}`;

  const showInRange = useMemo(() => {
    return currentPrice.lte(priceRangeMax) && currentPrice.gte(priceRangeMin);
  }, [currentPrice, priceRangeMax, priceRangeMin]);

  return (
    <div className={classes.cowcentratedHeader}>
      <div className={clsx(classes.cowcentratedStat, classes.roundBottomLeft)}>
        <div className={classes.label}>{t('Min Price')}</div>
        <div className={classes.value}>
          {formatTokenDisplayCondensed(priceRangeMin, 18)} <span>{priceString}</span>
        </div>
      </div>
      <div className={classes.cowcentratedStat}>
        <div className={classes.label}>
          {t('Current Price')}{' '}
          <span className={showInRange ? classes.inRange : classes.outOfRange}>
            ({t(showInRange ? 'In Range' : 'Out of Range')})
          </span>
        </div>
        <div className={classes.value}>
          {formatTokenDisplayCondensed(currentPrice, 18)} <span>{priceString}</span>
        </div>
      </div>
      <div className={clsx(classes.cowcentratedStat, classes.roundBottomRight)}>
        <div className={classes.label}>{t('Max Price')}</div>
        <div className={classes.value}>
          {formatTokenDisplayCondensed(priceRangeMax, 18)} <span>{priceString}</span>
        </div>
      </div>
    </div>
  );
});

const formatDateTimeTick = (timestamp: number, bucket: ApiTimeBucket) => {
  const date = fromUnixTime(timestamp);
  if (bucket === '1h_1d') {
    return format(date, 'HH:mm');
  }
  return date.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' });
};
