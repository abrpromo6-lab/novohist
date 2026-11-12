import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
// WebGL no Windows headless
Config.setChromiumOpenGlRenderer('angle');
Config.setConcurrency(2);
