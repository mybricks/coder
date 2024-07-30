const syncScheduler = (tasks, max, callback) => {
  const len = tasks.length;
  const queue = [];
  const ret = [];
  let index = 0;
  const run = (task) => {
    const p = Promise.resolve(task());
    p.then((res) => {
      queue.splice(queue.indexOf(p), 1);
      if (ret.push(res) < len && index + 1 < len) {
        run(tasks[++index]);
      } else if (ret.length === len && typeof callback === "function") {
        callback(ret);
      }
    });
    if (queue.push(p) < max) {
      run(tasks[++index]);
    }
  };
  return run(tasks[index]);
};

const request = (task) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(task);
    }, task.time);
  });
};

const task = () => {
  return fetch("https://ai-gateway.corp.kuaishou.com/v2/code/completions", {
    method: "POST",
    headers: {
      "x-dmo-provider": "kwaipilot",
      "x-dmo-username": "tangxiaoxin",
      authorization: "Bearer mbjuOzymwpWZEO",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      path: "index.ts",
      codeBeforeCursor: `type IO = {
  inputs: Array<Function>
  outputs: Array<Function>
}
({ outputs, inputs }: IO) => {
  const [inputValue0] = inputs;
  const [output0] = outputs;
  output0(inputValue0);
}`,
      stream: false,
    }),
  }).then(async (res) => {
    if (res.ok) {
      const { data: completions } = await res.json();
      console.log(completions)
      return completions;
    }
  });
};

export const test = () => {
  syncScheduler(
    Array.from({ length: 200 }, (_, v) => () => task()),
    50,
    (ret: any) => {
      console.log(ret);
    }
  );
}