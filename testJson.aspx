<%@ Page Language="C#" %>
<%
    Response.Clear();
    Response.ContentType = "application/json";
    Response.Write("{\"test\": \"ok\"}");
    Response.End();
%> 