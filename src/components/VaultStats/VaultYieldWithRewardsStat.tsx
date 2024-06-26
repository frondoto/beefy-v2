import type { VaultEntity } from '../../features/data/entities/vault';
import { memo, useMemo } from 'react';
import {
  formatLargeUsd,
  formatTokenDisplayCondensed,
  formatTokenDisplay,
} from '../../helpers/format';
import { VaultValueStat } from '../VaultValueStat';
import {
  selectIsAnalyticsLoadedByAddress,
  selectUserDepositedTimelineByVaultId,
} from '../../features/data/selectors/analytics';
import { useAppSelector } from '../../store';
import { selectUserRewardsByVaultId } from '../../features/data/selectors/balance';
import { RewardsTooltip } from '../RewardsTooltip/RewardsTooltip';
import { styles } from './styles';
import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import { BasicTooltipContent } from '../Tooltip/BasicTooltipContent';
import { Tooltip } from '../Tooltip';
import type { VaultPnLDataType } from './types';
import { selectIsVaultCowcentrated } from '../../features/data/selectors/vaults';

const useStyles = makeStyles(styles);

export type VaultYieldStatProps = {
  vaultId: VaultEntity['id'];
  pnlData: VaultPnLDataType;
  walletAddress: string;
};

export const VaultYieldWithRewardsStat = memo<VaultYieldStatProps>(
  function VaultYieldWithRewardsStat({ vaultId, pnlData, walletAddress }) {
    const classes = useStyles();
    const vaultTimeline = useAppSelector(state =>
      selectUserDepositedTimelineByVaultId(state, vaultId, walletAddress)
    );

    const isLoaded = useAppSelector(state =>
      selectIsAnalyticsLoadedByAddress(state, walletAddress)
    );

    const { rewards } = useAppSelector(state =>
      selectUserRewardsByVaultId(state, vaultId, walletAddress)
    );

    const isCowcentratedVault = useAppSelector(state => selectIsVaultCowcentrated(state, vaultId));

    const { totalYield, totalYieldUsd, tokenDecimals } = pnlData;

    const hasRewards = useMemo(() => {
      return rewards.length !== 0 ? true : false;
    }, [rewards.length]);

    if (!vaultTimeline || !isLoaded || isCowcentratedVault) {
      return (
        <VaultValueStat
          label="VaultStat-Yield"
          showLabel={false}
          value={'-'}
          loading={isLoaded ? true : false}
        />
      );
    }

    return (
      <VaultValueStat
        label="VaultStat-Yield"
        value={
          <div className={classes.flexEnd}>
            <Tooltip
              content={
                <BasicTooltipContent title={formatTokenDisplay(totalYield, tokenDecimals)} />
              }
              triggerClass={clsx(classes.textGreen, classes.textOverflow, classes.maxWidth80, {
                [classes.maxWidth60]: hasRewards,
              })}
            >
              {formatTokenDisplayCondensed(totalYield, tokenDecimals)}
            </Tooltip>
            {hasRewards && (
              <>
                <div>+</div>
                <RewardsTooltip walletAddress={walletAddress} vaultId={vaultId} />
              </>
            )}
          </div>
        }
        subValue={formatLargeUsd(totalYieldUsd)}
        showLabel={false}
        loading={false}
      />
    );
  }
);
