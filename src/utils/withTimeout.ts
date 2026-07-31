/** Promise 超时，避免逆地理 / AI 请求挂死导致按钮长期灰色不可用 */
export function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  message = '请求超时，请重试',
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(new Error(message));
    }, ms);

    promise
      .then((value) => {
        window.clearTimeout(timer);
        resolve(value);
      })
      .catch((err) => {
        window.clearTimeout(timer);
        reject(err);
      });
  });
}
