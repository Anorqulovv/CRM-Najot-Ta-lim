import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { instance } from '../hooks';
import { toast } from "react-hot-toast"
import {useCookies} from "react-cookie"
import { useNavigate } from 'react-router-dom';
import PATH from './Path';
import QueryPATH from './QueryPath';

const LoginForm: React.FC = () => {
  const navigate = useNavigate()
  const [,setCookie,] = useCookies(['token']);
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: (body: { email: string, password: string }) => instance().post("/auth/login", body),
    onSuccess: (res) => {
      toast.success("Muvaffaqiyatli kirdinggiz!")
      setCookie("token", res.data.data.tokens.accessToken)
      navigate(PATH.home)
      queryClient.removeQueries({queryKey:[QueryPATH.me]})
    },
    onError: (err) => toast.error(err.message)
  })
  const onFinish = (values: { email: string, password: string }) => mutate(values)
  return (
    <Form className='mt-25!' name="login" autoComplete='off' initialValues={{ remember: true }} style={{ maxWidth: 400 }} onFinish={onFinish} >
      <h1 className='font-bold text-[40px] mb-5'>Tizimga kirish</h1>
      <Form.Item className='mb-7!' name="email" rules={[{ required: true, message: 'Email bosh qoldirmang!' }]}>
        <div>
          <p className='mb-1 text-[18px]'><span className='text-red-600'>*</span> Email</p>
          <Input allowClear size='large' prefix={<UserOutlined />} placeholder="Email kiriting" />
        </div>
      </Form.Item>
      <Form.Item className='mb-7!' name="password" rules={[{ required: true, message: "Parolni to'g'ri kiriting!" }]} >
        <div>
          <p className='mb-1 text-[18px]'><span className='text-red-600'>*</span> Parol</p>
          <Input.Password size='large' prefix={<LockOutlined />} type="password" placeholder="Parol kiriting" />
        </div>
      </Form.Item>
      <Button loading={isPending} className='bg-[#9c7751]! font-bold' size='large' block type="primary" htmlType="submit">
        Kirish
      </Button>
    </Form>
  );
};

export default LoginForm;