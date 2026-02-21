import gsap from "gsap";
import Draggable from "gsap/Draggable";
import Observer from "gsap/Observer";

gsap.registerPlugin(Observer, Draggable);

let currentLoop = null;
let currentObserver = null;
let currentDraggable = null;
let railContainer = null;
let isHovered = false;
let currentDirection = 1;
let listenersAttached = false;
let resizeTimeout = null;

const handleMouseEnter = () => {
  isHovered = true;

  if (!currentLoop) {
    return;
  }
  if (currentDraggable?.isPressed) {
    return;
  }

  gsap.killTweensOf(currentLoop);
  gsap.to(currentLoop, {
    timeScale: 0,
    duration: 0.5,
    ease: "power2.out",
    overwrite: true,
  });
};

const handleMouseLeave = () => {
  isHovered = false;

  if (!currentLoop) {
    return;
  }
  if (currentDraggable?.isPressed) {
    return;
  }

  gsap.to(currentLoop, {
    timeScale: currentDirection,
    duration: 0.5,
    ease: "power2.in",
    overwrite: true,
  });
};

const handleResize = () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    if (railContainer) {
      startMarquee();
    }
  }, 250);
};

export function killMarquee() {
  if (currentLoop) {
    currentLoop.kill();
  }
  if (currentObserver) {
    currentObserver.kill();
  }
  if (currentDraggable) {
    currentDraggable.kill();
  }

  if (railContainer && listenersAttached) {
    railContainer.removeEventListener("mouseenter", handleMouseEnter);
    railContainer.removeEventListener("mouseleave", handleMouseLeave);
    window.removeEventListener("resize", handleResize);
  }

  clearTimeout(resizeTimeout);
  listenersAttached = false;
  currentLoop = null;
  currentObserver = null;
  currentDraggable = null;
  railContainer = null;
}

export function startMarquee() {
  killMarquee();

  const items = gsap.utils.toArray(".scrolling-text .rail li");
  railContainer = document.querySelector(".scrolling-text .rail");

  if (items.length === 0) {
    return;
  }
  if (!railContainer) {
    return;
  }

  gsap.set(items, { clearProps: "all" });

  currentLoop = horizontalLoop(items, {
    repeat: -1,
    speed: 1,
    paddingRight: 0,
  });

  if (!listenersAttached) {
    railContainer.addEventListener("mouseenter", handleMouseEnter);
    railContainer.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", handleResize);
    listenersAttached = true;
  }

  const proxy = document.createElement("div");
  [currentDraggable] = Draggable.create(proxy, {
    trigger: railContainer,
    type: "x",
    onPress() {
      gsap.killTweensOf(currentLoop);
      gsap.to(currentLoop, { timeScale: 0, duration: 0.2, overwrite: true });
    },
    onDrag() {
      const dragRatio = 1 / currentLoop.pixelsPerSecond;
      const wrap = gsap.utils.wrap(0, currentLoop.duration());
      currentLoop.time(wrap(currentLoop.time() - this.deltaX * dragRatio));
    },
    onRelease() {
      const dir = this.getDirection("x");
      if (dir === "left") {
        currentDirection = 1;
      } else if (dir === "right") {
        currentDirection = -1;
      }

      if (isHovered) {
        return;
      }

      gsap.to(currentLoop, {
        timeScale: currentDirection,
        duration: 0.5,
        ease: "power1.in",
        overwrite: true,
      });
    },
  });

  currentObserver = Observer.create({
    type: "wheel,touch,pointer",
    onChangeY(self) {
      if (isHovered) {
        return;
      }
      if (currentDraggable?.isPressed) {
        return;
      }

      let factor = 2.0;
      if (self.deltaY < 0) {
        factor *= -1;
      }

      currentDirection = factor > 0 ? 1 : -1;

      gsap.killTweensOf(currentLoop);
      gsap.to(currentLoop, {
        timeScale: factor * 3,
        duration: 0.2,
        ease: "none",
        overwrite: true,
        onComplete: () => {
          if (isHovered) {
            return;
          }
          if (currentDraggable?.isPressed) {
            return;
          }

          gsap.to(currentLoop, {
            timeScale: currentDirection,
            duration: 1,
            ease: "power1.out",
          });
        },
      });
    },
  });
}

function horizontalLoop(items, config) {
  const elements = gsap.utils.toArray(items);
  const settings = config ?? {};
  const timeline = gsap.timeline({
    repeat: settings.repeat,
    paused: settings.paused,
    defaults: { ease: "none" },
    onReverseComplete: () => {
      timeline.totalTime(timeline.rawTime() + timeline.duration() * 100);
    },
  });

  const length = elements.length;
  const startX = elements[0].offsetLeft;
  const times = [];
  const widths = [];
  const xPercents = [];
  const pixelsPerSecond = (settings.speed ?? 1) * 100;

  const snap =
    settings.snap === false
      ? (v) => {
          return v;
        }
      : gsap.utils.snap(settings.snap ?? 1);

  gsap.set(elements, {
    xPercent: (i, el) => {
      const w = Number.parseFloat(gsap.getProperty(el, "width", "px"));
      widths[i] = w;
      const xProp = Number.parseFloat(gsap.getProperty(el, "x", "px"));
      const xPercentProp = gsap.getProperty(el, "xPercent");
      const val = snap((xProp / w) * 100 + xPercentProp);
      xPercents[i] = val;
      return val;
    },
  });

  gsap.set(elements, { x: 0 });

  const lastItem = elements[length - 1];
  const lastItemWidth = widths[length - 1];
  const lastItemScaleX = gsap.getProperty(lastItem, "scaleX");
  const parsedPadding = Number.parseFloat(settings.paddingRight);
  const paddingRight = Number.isNaN(parsedPadding) ? 0 : parsedPadding;
  const totalWidth =
    lastItem.offsetLeft +
    (xPercents[length - 1] / 100) * lastItemWidth -
    startX +
    lastItem.offsetWidth * lastItemScaleX +
    paddingRight;

  for (let i = 0; i < length; i++) {
    const item = elements[i];
    const width = widths[i];
    const itemScaleX = gsap.getProperty(item, "scaleX");
    const curX = (xPercents[i] / 100) * width;
    const distanceToStart = item.offsetLeft + curX - startX;
    const distanceToLoop = distanceToStart + width * itemScaleX;

    timeline
      .to(
        item,
        {
          xPercent: snap(((curX - distanceToLoop) / width) * 100),
          duration: distanceToLoop / pixelsPerSecond,
        },
        0
      )
      .fromTo(
        item,
        {
          xPercent: snap(((curX - distanceToLoop + totalWidth) / width) * 100),
        },
        {
          xPercent: xPercents[i],
          duration:
            (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond,
          immediateRender: false,
        },
        distanceToLoop / pixelsPerSecond
      )
      .add(`label${i}`, distanceToStart / pixelsPerSecond);

    times[i] = distanceToStart / pixelsPerSecond;
  }

  let curIndex = 0;
  timeline.next = (vars) => {
    return toIndex(curIndex + 1, vars);
  };
  timeline.previous = (vars) => {
    return toIndex(curIndex - 1, vars);
  };
  timeline.current = () => {
    return curIndex;
  };
  timeline.toIndex = (index, vars) => {
    return toIndex(index, vars);
  };
  timeline.times = times;
  timeline.progress(1, true).progress(0, true);

  if (settings.reversed) {
    if (timeline.vars.onReverseComplete) {
      timeline.vars.onReverseComplete();
    }
    timeline.reverse();
  }

  function toIndex(index, vars) {
    const options = vars ?? {};
    let targetIndex = index;
    if (Math.abs(targetIndex - curIndex) > length / 2) {
      targetIndex += targetIndex > curIndex ? -length : length;
    }
    const newIndex = gsap.utils.wrap(0, length, targetIndex);
    let time = times[newIndex];

    if (time > timeline.time() !== targetIndex > curIndex) {
      options.modifiers = { time: gsap.utils.wrap(0, timeline.duration()) };
      time += timeline.duration() * (targetIndex > curIndex ? 1 : -1);
    }
    curIndex = newIndex;
    options.overwrite = true;
    return timeline.tweenTo(time, options);
  }

  timeline.pixelsPerSecond = pixelsPerSecond;
  return timeline;
}
