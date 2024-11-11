import { memo, useMemo } from 'react';
import { isCowcentratedLikeVault, type VaultEntity } from '../../../features/data/entities/vault';
import {
  selectAllCowcentratedVaultsByChainId,
  selectVaultById,
} from '../../../features/data/selectors/vaults';
import type { BeefyState } from '../../../redux-types';
import { isDefined } from '../../../features/data/utils/array-utils';
import { useAppSelector } from '../../../store';
import { InternalLink } from '../Links/Links';
import { getIcon } from '../../../helpers/iconSrc';
import { Trans, useTranslation } from 'react-i18next';
import { ListJoin } from '../../ListJoin';
import type { ChainEntity } from '../../../features/data/entities/chain';
import {
  selectChainWrappedNativeToken,
  selectTokenByIdOrUndefined,
} from '../../../features/data/selectors/tokens';
import {
  selectConcentratedLiquidityManagerPlatforms,
  selectPlatformById,
} from '../../../features/data/selectors/platforms';
import { orderBy } from 'lodash-es';
import { selectVaultTvl } from '../../../features/data/selectors/tvl';
import { DismissibleBanner } from '../Banner/DismissibleBanner';
import { selectVaultTotalApy } from '../../../features/data/selectors/apy';
import { formatLargePercent } from '../../../helpers/format';

type GammaBannerProps = {
  vaultId: VaultEntity['id'];
};

function selectNormalizeAsset(state: BeefyState, chainId: ChainEntity['id'], assetId: string) {
  let token = selectTokenByIdOrUndefined(state, chainId, assetId);
  if (!token) {
    return assetId.toLowerCase().replace(/^w/, '');
  }

  if (token.type === 'native') {
    token = selectChainWrappedNativeToken(state, chainId);
  }

  return token.symbol.toLowerCase();
}

function selectNormalizeAssets(state: BeefyState, chainId: ChainEntity['id'], assetIds: string[]) {
  return assetIds.map(id => selectNormalizeAsset(state, chainId, id)).sort();
}

function selectAreAssetIdsAreEqual(
  state: BeefyState,
  chainId: ChainEntity['id'],
  a: string[],
  b: string[]
) {
  if (a.length !== b.length) {
    return false;
  }
  const an = selectNormalizeAssets(state, chainId, a);
  const bn = selectNormalizeAssets(state, chainId, b);
  return an.every((id, i) => id === bn[i]);
}

function selectClmIdsMatchingGamma(state: BeefyState, vaultId: VaultEntity['id']) {
  const vault = selectVaultById(state, vaultId);
  const clmPlatforms = selectConcentratedLiquidityManagerPlatforms(state);

  if (
    vault.status !== 'eol' ||
    (!isCowcentratedLikeVault(vault) && !clmPlatforms.includes(vault.platformId))
  ) {
    return undefined;
  }

  const clms = selectAllCowcentratedVaultsByChainId(state, vault.chainId);
  const sameAssets = clms.filter(
    clm =>
      clm.id !== vault.id &&
      clm.chainId === vault.chainId &&
      clm.status === 'active' &&
      selectAreAssetIdsAreEqual(state, vault.chainId, clm.assetIds, vault.assetIds)
  );
  if (!sameAssets.length) {
    return undefined;
  }

  // only vaults if there is any
  let type: 'vault' | 'pool' = 'vault';
  let ids = sameAssets.map(clm => clm.cowcentratedIds.vault).filter(isDefined);

  // otherwise pools
  if (!ids.length) {
    type = 'pool';
    ids = sameAssets.map(clm => clm.cowcentratedIds.pool).filter(isDefined);
  }

  if (!ids.length) {
    return undefined;
  }

  return {
    ids: orderBy(ids, id => selectVaultTvl(state, id).toNumber(), 'desc'),
    type,
  };
}

const VaultLink = memo(function VaultLink({ vaultId }: { vaultId: VaultEntity['id'] }) {
  const { t } = useTranslation();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const platform = useAppSelector(state => selectPlatformById(state, vault.platformId));
  const apy = useAppSelector(state => selectVaultTotalApy(state, vaultId));
  const apyLabel = vault.type == 'gov' && vault.strategyTypeId !== 'compounds' ? 'APR' : 'APY';

  return (
    <Trans
      t={t}
      i18nKey="Banner-RetiredSuggestClm-Link"
      values={{
        name: vault.names.short,
        platform: (platform && platform.name) || vault.platformId,
        apy: `${formatLargePercent(apy.boostedTotalApy || apy.totalApy)} ${apyLabel}`,
      }}
      components={{
        Link: <InternalLink to={`/vault/${vault.id}`} />,
      }}
    />
  );
});

export const RetiredSuggestClmBanner = memo(function GammaBanner({ vaultId }: GammaBannerProps) {
  const { t } = useTranslation();
  const matching = useAppSelector(state => selectClmIdsMatchingGamma(state, vaultId));
  const components = useMemo(
    () =>
      matching && {
        Links: (
          <ListJoin
            mode="or"
            items={matching.ids.map(matchingId => (
              <VaultLink key={matchingId} vaultId={matchingId} />
            ))}
          />
        ),
      },
    [matching]
  );

  if (!matching) {
    return null;
  }

  return (
    <DismissibleBanner
      id={`retired-suggestions.${vaultId}`}
      icon={<img src={getIcon('clm')} alt="" aria-hidden={true} />}
      text={
        <Trans
          t={t}
          i18nKey={`Banner-RetiredSuggestClm-${matching.type}`}
          values={{ count: matching.ids.length }}
          components={components}
        />
      }
    />
  );
});
