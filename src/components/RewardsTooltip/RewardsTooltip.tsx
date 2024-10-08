import { memo } from 'react';
import { styles } from './styles';
import { makeStyles } from '@material-ui/core';
import type { VaultEntity } from '../../features/data/entities/vault';
import { Tooltip } from '../Tooltip';
import { AssetsImage } from '../AssetsImage';
import { useAppSelector } from '../../store';
import { useTranslation } from 'react-i18next';
import { selectDashboardUserRewardsByVaultId } from '../../features/data/selectors/balance';
import type { TokenEntity } from '../../features/data/entities/token';
import type BigNumber from 'bignumber.js';
import { formatTokenDisplayCondensed, formatLargeUsd } from '../../helpers/format';
import { selectVaultById } from '../../features/data/selectors/vaults';

const useStyles = makeStyles(styles);

interface RewardsTooltipProps {
  vaultId: VaultEntity['id'];
  size?: number;
  walletAddress?: string;
}

export const RewardsTooltip = memo<RewardsTooltipProps>(function RewardsTooltip({
  vaultId,
  size = 20,
  walletAddress,
}) {
  const classes = useStyles();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const { rewards, rewardsTokens } = useAppSelector(state =>
    selectDashboardUserRewardsByVaultId(state, vaultId, walletAddress)
  );

  if (rewards.length === 0) {
    return null;
  }

  return (
    <Tooltip content={<RewardsTooltipContent rewards={rewards} />}>
      <div className={classes.container}>
        <AssetsImage chainId={vault.chainId} size={size} assetSymbols={rewardsTokens} />
      </div>
    </Tooltip>
  );
});

interface RewardsType {
  rewardToken: TokenEntity['oracleId'];
  rewardTokenDecimals: TokenEntity['decimals'];
  rewards: BigNumber;
  rewardsUsd: BigNumber;
}

interface RewardsTooltipContentProps {
  rewards: RewardsType[];
}

export const RewardsTooltipContent = memo<RewardsTooltipContentProps>(
  function RewardsTooltipContent({ rewards }) {
    const { t } = useTranslation();
    const classes = useStyles();
    return (
      <div>
        <div className={classes.tooltipTitle}>{t('Claimable rewards')}</div>
        <div className={classes.rewardsContainer}>
          {rewards.map(tokenRewards => {
            return (
              <div key={tokenRewards.rewardToken}>
                <div className={classes.rewardsText}>
                  {formatTokenDisplayCondensed(
                    tokenRewards.rewards,
                    tokenRewards.rewardTokenDecimals
                  )}{' '}
                  {tokenRewards.rewardToken}
                </div>
                <div className={classes.usdPrice}>{formatLargeUsd(tokenRewards.rewardsUsd)}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);
