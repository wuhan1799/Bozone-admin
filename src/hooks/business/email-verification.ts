import { computed } from 'vue';
import { useCountDown, useLoading } from '@sa/hooks';
import { REG_EMAIL } from '@/constants/reg';
import { useOp331d0cc4dbe99449d67d209c0de4264b } from '@/api/generated/邮件验证/邮件验证';

export function useEmailVerification() {
  const { loading, startLoading, endLoading } = useLoading();
  const { count, start, stop, isCounting } = useCountDown(60); // 60秒倒计时

  const label = computed(() => {
    let text = '获取邮箱验证码';

    const countingLabel = `${count.value}秒后重新获取`;

    if (loading.value) {
      text = '';
    }

    if (isCounting.value) {
      text = countingLabel;
    }

    return text;
  });

  function isEmailValid(email: string) {
    if (email.trim() === '') {
      window.$message?.error?.('请输入邮箱');

      return false;
    }

    if (!REG_EMAIL.test(email)) {
      window.$message?.error?.('邮箱格式不正确');

      return false;
    }

    return true;
  }

  async function sendEmailCode(email: string) {
    const valid = isEmailValid(email);

    if (!valid || loading.value || isCounting.value) {
      return;
    }

    startLoading();

    try {
      const sendMutation = useOp331d0cc4dbe99449d67d209c0de4264b();
      await sendMutation.mutateAsync({ data: { email } });

      window.$message?.success?.('邮箱验证码发送成功');

      start();
    } catch (error) {
      window.$message?.error?.('邮箱验证码发送失败');
      // eslint-disable-next-line no-console
      console.error('Send email code failed:', error);
    } finally {
      endLoading();
    }
  }

  return {
    label,
    start,
    stop,
    isCounting,
    loading,
    sendEmailCode
  };
}
