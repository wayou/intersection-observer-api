import React, { useState, useEffect, useCallback } from "react";
import "./App.css";

const IMAGE_API = "https://picsum.photos/200";
const PAGE_SIZE = 10;
const IMAGES_PAGED = new Array(PAGE_SIZE).fill(IMAGE_API);

let loaderObserver: IntersectionObserver;
let lazyLoadObserver: IntersectionObserver;
let options = {
  rootMargin: "0px",
  threshold: 0
};
let page = 0;

const App = () => {
  const [images, setImages] = useState<string[]>(IMAGES_PAGED);

  const infiniteCallback = useCallback<IntersectionObserverCallback>(
    (_entries, _observer) => {
      console.info(`loading page ${++page}`);
      setImages(prev => [...prev, ...IMAGES_PAGED]);
    },
    []
  );

  const lazyLoadCallback = useCallback<IntersectionObserverCallback>(
    (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // stop observer and load the image
          const lazyImage = entry.target as HTMLImageElement;
          console.log("lazy loading ", lazyImage);
          lazyImage.classList.remove("empty");
          lazyImage.src = lazyImage.dataset.src!;
          observer.unobserve(entry.target);
        }
      });
    },
    []
  );

  //setup  infinite loading
  useEffect(() => {
    if (!loaderObserver) {
      loaderObserver = new IntersectionObserver(infiniteCallback, options);
    }
    const target = document.querySelector("footer");
    if (target) {
      loaderObserver.observe(target);
    }
    return () => {
      if (target) {
        loaderObserver.unobserve(target);
      }
    };
  }, [infiniteCallback]);

  // setup lazy loading
  useEffect(() => {
    if (!lazyLoadObserver) {
      lazyLoadObserver = new IntersectionObserver(lazyLoadCallback, options);
    }
    const imgs = document.querySelectorAll("img.empty");
    if (imgs) {
      imgs.forEach(img => {
        lazyLoadObserver.observe(img);
      });
    }
    return () => {
      if (imgs) {
        imgs.forEach(img => {
          lazyLoadObserver.unobserve(img);
        });
      }
    };
  }, [lazyLoadCallback, images]);

  return (
    <div className="App">
      <div className="content-wrap">
        {images.map((image, index) => (
          <img className="empty" key={index} data-src={image + `?f=${index}`} />
        ))}
      </div>
      <footer>loading more ....</footer>
    </div>
  );
};

export default App;
