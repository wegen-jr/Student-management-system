<?php
$host = 'localhost';
$dbname = 'SMS';
$user = 'root';
$pass = '';
$conn="";
try{
    $conn=mysqli_connect($host,$user,$pass,$dbname);
}catch(mysqli_sql_exception $e){
    echo "error".$e->getMessage();
}
?>