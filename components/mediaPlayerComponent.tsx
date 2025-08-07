// ✅ Full-featured VideoPlayerComponent using expo-av
import React, { useRef, useState, useEffect } from 'react';
import { Modal, View, TouchableOpacity, StyleSheet, Dimensions, Text, Image, ImageBackground } from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const DEFAULT_COVER = require('@/utils/music-cover.jpg'); // fallback image

import { Video, Audio } from 'expo-av';
import { X, Pause, Play, FastForward, Rewind, Maximize2, Volume2, VolumeX, CornerDownRight, CornerDownLeft } from 'lucide-react-native';

const formatTime = (millis) => {
  if (millis == null) return '00:00';
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes < 10 ? '0' : ''}${minutes}:${
    seconds < 10 ? '0' : ''
  }${seconds}`;
};

export const VideoPlayerComponent = ({ uri, onClose }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(1);

  const handleTogglePlay = async () => {
    if (!videoRef.current) return;
    const status = await videoRef.current.getStatusAsync();
    if (status.isPlaying) {
      await videoRef.current.pauseAsync();
      setIsPlaying(false);
    } else {
      await videoRef.current.playAsync();
      setIsPlaying(true);
    }
  };

  const skip = async (seconds) => {
    if (!videoRef.current) return;
    const status = await videoRef.current.getStatusAsync();
    if (status.isLoaded) {
      let newPosition = status.positionMillis + seconds * 1000;
      if (newPosition < 0) newPosition = 0;
      if (newPosition > status.durationMillis) newPosition = status.durationMillis;
      await videoRef.current.setPositionAsync(newPosition);
    }
  };

  // const toggleFullscreen = () => {
  //   setIsFullscreen(!isFullscreen);
  // };

  const toggleMute = async () => {
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    await videoRef.current.setIsMutedAsync(newMuteState);
  };

  const handleProgress = async () => {
    if (!videoRef.current) return;
    const status = await videoRef.current.getStatusAsync();
    if (status.isLoaded) {
      setProgress(status.positionMillis);
      setDuration(status.durationMillis);
    }
  };

  useEffect(() => {
    const interval = setInterval(handleProgress, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSeek = async (value) => {
    await videoRef.current.setPositionAsync(value);
  };

  return (
    <Modal visible={!!uri} animationType="slide" transparent>
      <View style={[styles.overlay, isFullscreen && styles.fullscreenOverlay]}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <X size={28} color="#fff" />
        </TouchableOpacity>

        <Video
          ref={videoRef}
          source={{ uri }}
          rate={1.0}
          volume={volume}
          resizeMode="contain"// or cover
          shouldPlay
          isMuted={isMuted}
          useNativeControls={false}
          style={isFullscreen ? styles.fullscreenVideo : styles.video}
        />

        <Slider
          style={styles.videoSlider}
          minimumValue={0}
          maximumValue={duration}
          value={progress}
          onSlidingComplete={handleSeek}
          minimumTrackTintColor="#fff"
          maximumTrackTintColor="#666"
          thumbTintColor="#fff"
        />

        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(progress)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>

        <View style={styles.controlsContainer}>
          <TouchableOpacity style={{...styles.controlButton,opacity:0}}>
            <Maximize2 size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => skip(-10)} style={styles.controlButton}>
            <Rewind size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleTogglePlay} style={styles.controlButton}>
            {isPlaying ? <Pause size={28} color="#fff" /> : <Play size={28} color="#fff" />}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => skip(10)} style={styles.controlButton}>
            <FastForward size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleMute} style={styles.controlButton}>
            {isMuted ? <VolumeX size={24} color="#fff" /> : <Volume2 size={24} color="#fff" />}
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
};

export const AudioPlayerComponent = ({ uri, title = 'Unknown Title', artist = '', onClose }) => {
  const soundRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(1);
  const [position, setPosition] = useState(0);
  const [speed, setSpeed] = useState(1.0);

  const loadAndPlay = async () => {
    if (!uri) return;
    const { sound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: true, rate: speed }
    );
    soundRef.current = sound;

    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded) {
        setDuration(status.durationMillis || 1);
        setPosition(status.positionMillis || 0);

        if (status.didJustFinish) {
          // Optionally do something when playback finishes
          setIsPlaying(false);
        }
      }
    });
    setIsPlaying(true);
  };

  useEffect(() => {
    if (uri) loadAndPlay();

    return () => {
      if (soundRef.current) {
        soundRef.current.stopAsync();
        soundRef.current.unloadAsync();
      }
    };
  }, [uri]);

  useEffect(() => {
    // Update the playback speed if it changes and sound is loaded
    if (soundRef.current) {
      soundRef.current.setRateAsync(speed, true);
    }
  }, [speed]);

  const togglePlayback = async () => {
    if (!soundRef.current) return;

    const status = await soundRef.current.getStatusAsync();
    if (status.isPlaying) {
      await soundRef.current.pauseAsync();
      setIsPlaying(false);
    } else {
      await soundRef.current.playAsync();
      setIsPlaying(true);
    }
  };

  const changeSpeed = () => {
    const newSpeed = speed === 1.0 ? 1.5 : speed === 1.5 ? 2.0 : 1.0;
    setSpeed(newSpeed);
  };

  const handleSeek = async (value) => {
    if (!soundRef.current) return;
    await soundRef.current.setPositionAsync(value);
    setPosition(value);
  };

  const forward10Seconds = async () => {
    if (!soundRef.current) return;
    let newPosition = Math.min(position + 10000, duration);
    await soundRef.current.setPositionAsync(newPosition);
    setPosition(newPosition);
  };

  const rewind10Seconds = async () => {
    if (!soundRef.current) return;
    let newPosition = Math.max(position - 10000, 0);
    await soundRef.current.setPositionAsync(newPosition);
    setPosition(newPosition);
  };

  return (
    <Modal visible={!!uri} animationType="slide" transparent={false}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>

        <Image
          source={ DEFAULT_COVER}
          style={{...styles.coverImage}}
          resizeMode="contain"
        />

        <Text style={styles.titleText} numberOfLines={2}>
          {uri.split('/').pop()}
        </Text>
        {artist ? (
          <Text style={styles.artistText} numberOfLines={1}>
            {artist}
          </Text>
        ) : null}

        <Slider
          style={styles.audioSlider}
          minimumValue={0}
          maximumValue={duration}
          value={position}
          onSlidingComplete={handleSeek}
          minimumTrackTintColor="#fff"
          maximumTrackTintColor="rgba(255,255,255,0.5)"
          thumbTintColor="#fff"
        />

        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{formatTime(position)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>

        <View style={styles.controlsRow}>
          <TouchableOpacity onPress={rewind10Seconds} style={styles.controlButton}>
            <Ionicons name="play-back" size={36} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={togglePlayback} style={styles.playPauseButton}>
            {isPlaying ? (
              <Ionicons name="pause" size={48} color="#fff" />
            ) : (
              <Ionicons name="play" size={48} color="#fff" />
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={forward10Seconds} style={styles.controlButton}>
            <Ionicons name="play-forward" size={36} color="#fff" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={changeSpeed} style={styles.speedButton}>
          <Text style={styles.speedText}>{speed.toFixed(1)}x</Text>
        </TouchableOpacity>
        
      </View>
    </Modal>
  );
};


const { width, height } = Dimensions.get('window');
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#000c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenOverlay: {
    backgroundColor: 'black',
  },
  video: {
    width: width,
    height: height * 0.6,
  },
  fullscreenVideo: {
    width: width,
    height: height,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 60,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    alignItems: 'center',
  },
  controlButton: {
    backgroundColor: '#333a',
    padding: 12,
    borderRadius: 30,
    marginHorizontal: 5,
  },
  playPause: {
    marginTop: 20,
    backgroundColor: '#333a',
    padding: 12,
    borderRadius: 30,
  },
  audioSlider: {
    position: 'absolute',
    // bottom: 110,
    top:500,
    width: width * 0.9,
    alignSelf: 'center',
    height: 40,

  },
  videoSlider: {
    position: 'absolute',
    bottom: 110,
    width: width * 0.9,
    alignSelf: 'center',
    height: 40,

  },
  timeContainer: {
    position: 'absolute',
    bottom: 90,
    width: width * 0.9,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  text: {
    fontSize: 20,
    color: 'white',
    marginBottom: 20,
  },

  container: {
    flex: 1,
    backgroundColor: '#8e44ad', // purple background
    paddingTop: 60,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
  },
  coverImage: {
    width: 230,
    height: 210,
    borderRadius: 16,
    marginBottom: 20,
    backgroundColor: '#4a235a', // subtle fallback bg if no image
  },
  titleText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 6,
    maxWidth: '100%',
    textAlign: 'center',
  },
  artistText: {
    color: '#d1c4e9',
    fontSize: 16,
    marginBottom: 20,
    maxWidth: '100%',
    textAlign: 'center',
  },
  timeRow: {
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  timeText: {
    color: '#ddd',
    fontSize: 14,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playPauseButton: {
    marginHorizontal: 20,
    backgroundColor: '#6c3483',
    borderRadius: 50,
    padding: 12,
  },
  speedButton: {
    marginTop: 150,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  speedText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});