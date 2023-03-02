import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  header: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,minmax(0,1fr))',
    padding: '24px',
    borderRadius: '12px 12px 0px 0px',
    backgroundColor: '#232743',
    [theme.breakpoints.down('md')]: {
      padding: '16px',
      gridTemplateColumns: 'repeat(1,minmax(0,1fr))',
      rowGap: '0',
    },
  },
  listMobile: {
    display: 'grid',
    marginTop: '8px',
    gridTemplateColumns: 'repeat(1,minmax(0,1fr))',
    rowGap: '8px',
  },
  itemContainer: { display: 'flex', columnGap: '24px' },
  textContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    rowGap: '4px',
    [theme.breakpoints.down('md')]: {
      flexDirection: 'row' as const,
      width: '100%',
      justifyContent: 'space-between',
    },
  },
  label: {
    ...theme.typography['subline-lg'],
    color: theme.palette.text.disabled,
    textTransform: 'uppercase' as const,
    fontWeight: 700,
    [theme.breakpoints.down('md')]: {
      color: theme.palette.text.secondary,
      ...theme.typography['body-lg-med'],
    },
  },
  value: {
    display: 'flex',
    alignItems: 'center',
    columnGap: '4px',
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.secondary,
    fontWeight: 500,
    [theme.breakpoints.down('md')]: {
      justifyContent: 'flex-end',
    },
    '& span': {
      textDecoration: 'none',
      ...theme.typography['subline-sm'],
      color: theme.palette.text.disabled,
      fontWeight: 700,
    },
  },
  greenValue: {
    color: theme.palette.primary.main,
  },
  subValue: {
    ...theme.typography['subline-sm'],
    color: theme.palette.text.disabled,
    [theme.breakpoints.down('md')]: {
      textAlign: 'end',
    },
  },
  border: {
    height: '64px',
    width: '2px',
    borderRadius: '8px',
    backgroundColor: theme.palette.background.content,
    [theme.breakpoints.down('md')]: {
      display: 'none',
    },
  },
  withTooltip: {
    textDecoration: 'underline 1px dotted',
    cursor: 'default' as const,
  },
  textOverflow: {
    maxWidth: '90px',
    overflow: 'hidden',
    whiteSpace: 'nowrap' as const,
    textOverflow: 'ellipsis',
    [theme.breakpoints.only('md')]: {
      maxWidth: '100%',
    },
    [theme.breakpoints.only('sm')]: {
      maxWidth: '100%',
    },
  },
  labelContainer: {
    display: 'flex',
    alignItems: 'center',
    columnGap: '4px',
    '& svg': {
      color: theme.palette.text.disabled,
      height: '16px',
      width: '16px',
      '&:hover': {
        cursor: 'pointer',
      },
    },
  },
  center: {
    display: 'flex',
    alignItems: 'center',
  },
  handleButton: {
    display: 'flex',
    alignItems: 'center',
    ...theme.typography['body-lg-med'],
    color: theme.palette.primary.main,
    columnGap: '4px',
    marginTop: '8px',
  },
  hideCollapse: {
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  arrow: {
    height: '18px',
    width: '18px',
  },
  active: {
    transform: 'rotateX(180deg)',
  },
});