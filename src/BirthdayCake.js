import React, { useEffect, useState } from 'react';
import { useSprings, animated } from 'react-spring';
import './BirthdayCake.css';

const BirthdayCake = () => {
  const [numberOfCandles, setNumberOfCandles] = useState(0); 
  const [numberOfFlames, setNumberOfFlames] = useState(''); 
  const [inputValue, setInputValue] = useState('');
  const [animationStarted, setAnimationStarted] = useState(false);
  const [blowing, setBlowing] = useState(false);
  const [candlePositions, setCandlePositions] = useState([]);

  /*
   * INPUT
   */

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setAnimationStarted(false);
    setNumberOfCandles(0);
    setNumberOfFlames(0);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      const parsedValue = parseInt(inputValue, 10);
      if (!isNaN(parsedValue) && parsedValue >= 0) {
        setNumberOfCandles(parsedValue);
        setAnimationStarted(true);        
        updateCandlePositions(parsedValue);
      }
    } else {
      setAnimationStarted(false);
    }
  };

  /*
   * ANIMATIONS
   */

  const getRandomPosition = () => {
    const min = -100; 
    const max = 308; 
    return Math.floor(Math.random() * (max - min + 1) + min);
  };

  const getRandomYPosition = () => {
    const minY = -265; 
    const maxY = -245;
    return Math.floor(Math.random() * (maxY - minY + 1) + minY);
  };

  const updateCandlePositions = (numberOfCandles) => {
    const newCandlePositions = Array.from({ length: numberOfCandles }, (_, index) => ({
      id: index,
      left: getRandomPosition(),
      bottom: getRandomYPosition(),
    }));
    setCandlePositions(newCandlePositions);
    setNumberOfFlames(numberOfCandles);
  };

  const springs = useSprings(
    numberOfCandles,
    candlePositions.map(({ bottom }, index) => {
      return {
        from: { bottom: animationStarted ? 1500 : bottom },
        to: { bottom },
        config: { duration: 150 + index * 100 },
      }
    })
  );

  const flameSprings = useSprings(
    numberOfFlames,
    candlePositions.map(({ bottom }, index) => {
      const shouldDisappear = blowing && Math.random() < 0.25;
  
      return {
        from: { bottom: animationStarted ? 1500 : bottom, opacity: 1 },
        to: {
          bottom: bottom,
          opacity: shouldDisappear ? 0 : 1,
        },
        config: { duration: 150 + index * 100 },
        onRest: () => {
          if (shouldDisappear) {
            setNumberOfFlames((prev) => Math.max(0, prev - removeRandomCandles()));
          }
        },
      };
    })
  );

  /*
   * BLOWING
   */

  const removeRandomCandles = () => {
    const min = 1; 
    const max = numberOfCandles / 4; 
    return Math.floor(Math.random() * (max - min + 1) + min);
  };

  useEffect(() => {
    const handleMicInput = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioContext = new AudioContext();
        const analyzer = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyzer);
        analyzer.fftSize = 256;
        const bufferLength = analyzer.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const detectBlowing = () => {
          analyzer.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
          setBlowing(average > 25);
          requestAnimationFrame(detectBlowing);
        };

        detectBlowing();
      } catch (error) {
        console.error('Error accessing microphone:', error);
      }
    };

    handleMicInput();
  }, []);

  return (
    <div>
      <div style={{ marginTop: '50px' }}>
        <label htmlFor="ageInput">Enter your age:</label>
        <br />
        <input
          type="text"
          id="ageInput"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
        />
      </div>
      {numberOfCandles !== null && (
        <div className="cake">
          <div className="rectangle2"></div>
          <div className="bottomEllipse2"></div>
          <div className="topEllipse2"></div>
          <div className="rectangle"></div>
          <div className="bottomEllipse"></div>
          <div className="topEllipse"></div>
          {springs.map((spring, index) => (
            <div key={index} style={{ position: 'relative' }}>
              <animated.div
                className="candle"
                style={{
                  left: `${candlePositions[index].left}px`,
                  bottom: spring.bottom.interpolate((value) => `${value}px`),
                }}
              ></animated.div>
            </div>
          ))}
          {flameSprings.map((spring, index) => (
            <div key={index} style={{ position: 'relative' }}>
              <animated.div
                className="flame"
                style={{
                  left: `${candlePositions[index].left}px`,
                  bottom: spring.bottom.interpolate((value) => `${value + 100}px`),
                  opacity: spring.opacity,
                }}
              ></animated.div>
            </div>
          ))}
        </div>
      )}

      {numberOfFlames === 0 && animationStarted && (
        <div style={{ position: 'fixed', top: '28%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <p style={{ fontSize: '40px', fontFamily: 'Times', fontWeight: 'bold', color: 'black' }}>
              Happy Birthday!
            </p>
        </div>
      )}
    </div>
  );
};

export default BirthdayCake;