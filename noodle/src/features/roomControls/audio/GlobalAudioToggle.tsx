import client from '@api/client';
import { useRoomStore } from '@api/useRoomStore';
import { Spacing, SpacingProps } from '@components/Spacing/Spacing';
import { BasicAuth } from '@components/BasicAuth/BasicAuth';
import { Box, Card, CardActionArea, CardContent, CardMedia, Dialog, makeStyles, Typography } from '@material-ui/core';
import globalAudioOnVideo from '@src/videos/global_audio/global.mp4';
import globalAudioOffVideo from '@src/videos/global_audio/nearby.mp4';
import clsx from 'clsx';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

export function GlobalAudioToggle(props: SpacingProps) {
  const { t } = useTranslation();
  const isGlobalAudioOn = useRoomStore((room) => room.state.isAudioGlobal);
  const [authAction, setAuthAction] = React.useState<'on' | 'off' | null>(null);

  const handleSetAudioGlobalOff = () => {
    setAuthAction('off');
  };

  const handleSetAudioGlobalOn = () => {
    setAuthAction('on');
  };

  const handleAuthSuccess = () => {
    if (authAction === 'off') {
      client.roomState.setIsAudioGlobal(false);
    } else if (authAction === 'on') {
      client.roomState.setIsAudioGlobal(true);
    }
    setAuthAction(null);
  };

  const handleAuthCancel = () => {
    setAuthAction(null);
  };

  return (
    <Spacing {...props}>
      {authAction !== null && (
        <AuthDialog 
          isOpen={authAction !== null}
          onSuccess={handleAuthSuccess}
          onCancel={handleAuthCancel}
        />
      )}
      
      <AudioToggleCard
        title={t('features.mediaControls.globalAudioOffTitle')}
        description={t('features.mediaControls.globalAudioOffDescription')}
        videoSrc={globalAudioOffVideo}
        selected={!isGlobalAudioOn}
        onClick={handleSetAudioGlobalOff}
      />
      <AudioToggleCard
        title={t('features.mediaControls.globalAudioOnTitle')}
        description={t('features.mediaControls.globalAudioOnDescription')}
        videoSrc={globalAudioOnVideo}
        selected={isGlobalAudioOn}
        onClick={handleSetAudioGlobalOn}
      />
    </Spacing>
  );
}

const useCardStyles = makeStyles((theme) => ({
  card: {
    overflow: 'visible',
    border: '1px solid',
    borderColor: theme.palette.grey[500],
  },
  selected: {
    boxShadow: theme.focusRings.create(theme.palette.brandColors.lavender.bold, true),
  },
  video: {
    height: '100%',
    width: '100%',
    objectFit: 'cover',
  },
  textContent: {
    padding: theme.spacing(4),
    backgroundColor: theme.palette.common.white,
    flex: '1 0 auto',
  },
  videoContent: {
    flex: '1 1 auto',
    minHeight: 0,
  },
}));

function AudioToggleCard({
  selected,
  description,
  videoSrc,
  title,
  onClick,
  ...props
}: {
  selected: boolean;
  title: string;
  description: string;
  videoSrc: string;
  onClick: () => void;
}) {
  const classes = useCardStyles();

  return (
    <Card className={clsx(classes.card, selected && classes.selected)} {...props}>
      <CardActionArea disabled={selected} onClick={onClick} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" height="100%">
          <CardMedia className={classes.videoContent}>
            <video src={videoSrc} className={classes.video} autoPlay loop muted playsInline />
          </CardMedia>
          <CardContent className={classes.textContent}>
            <Typography variant="h3">{title}</Typography>
            <Typography>{description}</Typography>
          </CardContent>
        </Box>
      </CardActionArea>
    </Card>
  );
}

interface AuthDialogProps {
  isOpen: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

function AuthDialog({ isOpen, onSuccess, onCancel }: AuthDialogProps) {
  // Create a component to handle authentication success
  const AuthSuccessHandler = () => {
    // Use useEffect to call onSuccess after the component mounts
    // This ensures that BasicAuth has successfully authenticated
    React.useEffect(() => {
      onSuccess();
    }, []);
    
    return null; // This component doesn't render anything
  };

  return (
    <Dialog open={isOpen} onClose={onCancel}>
      <Box p={3} minWidth={300} minHeight={100} display="flex" justifyContent="center" alignItems="center">
        <BasicAuth>
          <AuthSuccessHandler />
        </BasicAuth>
      </Box>
    </Dialog>
  );
}
