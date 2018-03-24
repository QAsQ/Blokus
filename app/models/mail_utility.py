import smtplib
import email
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage
from email.mime.base import MIMEBase
from email.mime.application import MIMEApplication
from email.header import Header

def send_mail(target_address, message_head, message_body, config):
    username = config['username']
    password = config['password'] 
    replyto = ""

    rcptto = target_address

    # 构建alternative结构
    msg = MIMEMultipart('alternative')
    msg['Subject'] = Header(message_head).encode()
    msg['From'] = '%s <%s>' % (Header('No-Reply-Bolkus'), username)
    msg['To'] = rcptto
    msg['Reply-to'] = replyto
    msg['Message-id'] = email.utils.make_msgid()
    msg['Date'] = email.utils.formatdate() 

    # 构建alternative的text/html部分
    texthtml = MIMEText(message_body, _subtype='html', _charset='UTF-8')
    msg.attach(texthtml)
    # 发送邮件
    try:
        client = smtplib.SMTP_SSL()
        client.connect('smtpdm.aliyun.com', 465)
        client.set_debuglevel(0)
        client.login(username, password)
        client.sendmail(username, rcptto, msg.as_string())
        client.quit()
        return 'success'
    except (smtplib.SMTPConnectError) as e:
        return '邮件发送失败，连接失败:' + str(e.smtp_code) + str(e.smtp_error)
    except (smtplib.SMTPAuthenticationError) as e:
        return '邮件发送失败，认证错误:'+ str(e.smtp_code) + str(e.smtp_error)
    except (smtplib.SMTPSenderRefused) as e:
        return '邮件发送失败，发件人被拒绝:'+ str(e.smtp_code) + str(e.smtp_error)
    except (smtplib.SMTPRecipientsRefused) as e:
        return '邮件发送失败，收件人被拒绝'
    except (smtplib.SMTPDataError) as e:
        return '邮件发送失败，数据接收拒绝:'+ e.smtp_code+ e.smtp_error
    except (smtplib.SMTPException) as e:
        return '邮件发送失败'
    except (Exception) as e:
        return '邮件发送异常 ' + str(e)
    
    return 'success'

def send_register_mail(user_email, url, config):
    message_body = '''
    <h1>Blokus 注册</h1>

    <p>您好！欢迎加入 blokus.io ，请点击<a href="{url}">这里</a> 注册您的 blokus.io 账户<p>
    <p>如果连接失效，也可以手动复制以下网址到浏览器访问 {url}</p>
    <p>最后祝您，身体健康</p>
    <p>再见</p>

    '''.format(url=url)
    message_head = '[Blokus] 注册'

    return send_mail(user_email, message_head, message_body, config)

def send_confirm_email(username, user_email, url, config):
    message_body = '''
    <h1>Blokus 激活邮箱</h1>

    <p>您好！请点击<a href="{url}">这里</a> 激活您的邮箱<p>
    <p>如果连接失效，也可以手动复制以下网址到浏览器访问 {url}</p>
    <p>最后祝您，身体健康</p>
    <p>再见</p>

    <p> 如果您不是 {username} ,请忽略此邮件 </p>
    '''.format(url=url, username=username)
    message_head = '[Blokus] 激活邮箱'

    return send_mail(user_email, message_head, message_body, config)


def send_reset_mail(username, user_email, url, config):
    message_body = '''
    <h1>Blokus 重置密码</h1>

    <p>您好！请点击<a href="{url}">这里</a> 重置您的密码<p>
    <p>如果连接失效，也可以手动复制以下网址到浏览器访问 {url}</p>
    <p>最后祝您，身体健康</p>
    <p>再见</p>

    <p> 如果您不是 {username} ,请忽略此邮件 </p>
    '''.format(url="https://blokus.io", username=username)
    message_head = '[Blokus] 重置密码'

    return send_mail(user_email, message_head, message_body, config)
