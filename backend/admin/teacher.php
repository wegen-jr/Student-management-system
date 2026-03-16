<?php
    header("Conten-Type: application/json");
    require "../config/database.php";

    $method=$_SERVER['REQUEST_METHOD'];
    $request_uri=$_SERVER['REQUEST_URI'];
    $path=parse_url($request_uri,PHP_URL_PATH);
    $script_name=$_SERVER['SCRIPT_NAME'];
    if(strpos($path,$script_name)===0){
        $path=substr($path,strlen($script_name));
    }
    $segment=explode('/',trim($path,'/'));
    $id=!empty($segment[0])? $segment[0]:null;

    switch($method){
        case 'GET':
            if($id){
                
            }

    }

?>