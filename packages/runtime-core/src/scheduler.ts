import { isArray } from "@vue/shared";

const queue: any[] = [];
const pendingPostFlushCbs = []
let activePostFlushCbs = null

const p = Promise.resolve();
let isFlushPending = false;

export function queueJob(job) {
  if (!queue.includes(job)) {
    queue.push(job);
    queueFlush();
  }
}

export function queuePostFlushCb(cb) {
  if(!isArray(cb)) {
    if(!activePostFlushCbs) {
      pendingPostFlushCbs.push(cb)
    }
  } else {
    pendingPostFlushCbs.push(...cb)
  }
  queueFlush();
}

// function queueCb(cb, activeQueue) {
//   activeQueue.push(cb);
//   queueFlush();
// }

function queueFlush() {
  if (isFlushPending) return;
  isFlushPending = true;
  nextTick(flushJobs);
}

const getId = (job) =>
  job.id == null ? Infinity : job.id

const comparator = (a, b) => {
  const diff = getId(a) - getId(b)
  if(diff === 0) {
    if (a.pre && !b.pre) return -1
    if (b.pre && !a.pre) return 1
  }
  return diff
}

function flushJobs() {
  isFlushPending = false;

  queue.sort(comparator)

  try {
    let job;
    while ((job = queue.shift())) {
      if (job) {
        job();
      }
    }
  } finally {
    flushPostFlushCbs()
    // 执行过程中产生了新的队列，那么继续执行回调
    if(queue.length || pendingPostFlushCbs.length) {
      flushJobs()
    }
  }
}

function flushPostFlushCbs() {
  if(pendingPostFlushCbs.length) {
    const deduped = [...new Set(pendingPostFlushCbs)]
    pendingPostFlushCbs.length = 0

    if(activePostFlushCbs) {
      activePostFlushCbs.push(...deduped)
      return
    }

    activePostFlushCbs = deduped
    activePostFlushCbs.sort((a, b) => getId(a) - getId(b))
    for(let i = 0; i < activePostFlushCbs.length; i++) {
      activePostFlushCbs[i]()
    }
    activePostFlushCbs = null
  }
}



export function nextTick(fn?) {
  return fn ? p.then(fn) : p;
}
