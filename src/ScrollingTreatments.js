import "./scrolling-treatments.css";
import gsap from "gsap";
import Observer from "gsap/Observer";

gsap.registerPlugin(Observer);

export async function initScrollingTreatments() {
  const railContainer = document.querySelector(".scrolling-text .rail ul");

  if (!railContainer) {
    return null;
  }

  try {
    const response = await fetch("/treatments-data.json");
    if (!response.ok) {
      throw new Error("Failed to load treatments data");
    }

    const data = await response.json();

    const itemsHTML = [...data, ...data]
      .map(
        (item) => `
        <li class="hover:text-info shrink-0 px-4 md:px-8">
          <a href="${item.url}" class="block w-full h-full">${item.treatment}</a>
        </li>`
      )
      .join("");

    railContainer.innerHTML = itemsHTML;

    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        const items = gsap.utils.toArray(".scrolling-text .rail li");

        if (items.length === 0) {
          return;
        }

        const loop = horizontalLoop(items, {
          repeat: -1,
          speed: 1,
          paddingRight: 0,
        });

        const scrollObserver = Observer.create({
          onChangeY(self) {
            let factor = 2.0;
            if (self.deltaY < 0) {
              factor *= -1;
            }

            gsap
              .timeline({ defaults: { ease: "none" } })
              .to(loop, {
                timeScale: factor * 3,
                duration: 0.2,
                overwrite: true,
              })
              .to(
                loop,
                {
                  timeScale: factor > 0 ? 1 : -1,
                  duration: 1,
                },
                "+=0.3"
              );
          },
        });

        resolve({
          destroy() {
            loop.kill();
            scrollObserver.kill();
          },
        });
      });
    });
  } catch (error) {
    console.error("ScrollingTreatments Error:", error);
    return null;
  }
}

function horizontalLoop(items, config) {
  const elements = gsap.utils.toArray(items);
  const settings = config || {};
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

  const pixelsPerSecond = (settings.speed || 1) * 100;

  const snap =
    settings.snap === false ? (v) => v : gsap.utils.snap(settings.snap || 1);

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
  const paddingRight = Number.parseFloat(settings.paddingRight) || 0;

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

  function toIndex(index, vars) {
    const options = vars || {};
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

  timeline.next = (vars) => toIndex(curIndex + 1, vars);
  timeline.previous = (vars) => toIndex(curIndex - 1, vars);
  timeline.current = () => curIndex;
  timeline.toIndex = (index, vars) => toIndex(index, vars);
  timeline.times = times;

  timeline.progress(1, true).progress(0, true);

  if (settings.reversed) {
    if (timeline.vars.onReverseComplete) {
      timeline.vars.onReverseComplete();
    }
    timeline.reverse();
  }

  return timeline;
}
