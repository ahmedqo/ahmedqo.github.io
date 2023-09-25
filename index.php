<?php
session_start();
$sites = $sites = json_decode(file_get_contents('./sites.json'), true)['sites'];
$password = '5f4dcc3b5aa765d61d8327deb882cf99';

if (isset($_REQUEST["out"]) && $_REQUEST['out'] == $password) {
    $_SESSION['admin'] = null;
    session_destroy();
    header("Location: ./index.php");
    exit;
}

if (isset($_POST['action']) && $_POST['action'] == $password) {
    array_push($sites, [
        'origin' => $_POST['origin'],
        'target' => $_POST['target'],
        'remote' => $_POST['remote'],
        'server' => $_POST['server'],
        'date' => date('Y-m-d H:i:s'),
    ]);
    file_put_contents('./sites.json', json_encode(['sites' => $sites]));
    echo json_encode(['sites' => $sites]);
    exit;
}

if (isset($_POST["submit"]) && isset($_POST["password"]) && md5($_POST['password']) == $password) {
    $_SESSION['admin'] = $password;
}
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="./x.elements.css">
    <link rel="stylesheet" href="./index.css">
    <title>Maker Notify</title>
</head>

<body>

    <body class="flex flex-col flex-wrap lg:flex-row">
        <?php if (isset($_SESSION['admin']) && $_SESSION['admin'] == $password && isset($sites)) { ?>
            <main class="p-4 w-full flex flex-col gap-10">
                <section class="container w-full mx-auto flex">
                    <a href="./index.php?out=5f4dcc3b5aa765d61d8327deb882cf99" class="block ms-auto text-red-500 underline underline-1 font-black text-xl">Logout</a>
                </section>
                <section class="container w-full mx-auto">
                    <table x-table search filter download="sites_list">
                        <thead>
                            <tr>
                                <td>Origin</td>
                                <td>Target</td>
                                <td>Remote</td>
                                <td>Server</td>
                                <td>Date</td>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($sites as $site) { ?>
                                <tr>
                                    <td class="text-lg">
                                        <a target="_blank" class="text-blue-500 underline underline-1" href="http://<?= $site['origin'] ?>"><?= $site['origin'] ?></a>
                                    </td>
                                    <td class="text-lg">
                                        <a target="_blank" class="text-blue-500 underline underline-1" href="http://<?= $site['origin'] . $site['target'] ?>"><?= $site['target'] ?></a>
                                    </td>
                                    <td class="text-lg"><?= $site['remote'] ?></td>
                                    <td class="text-lg"><?= $site['server'] ?></td>
                                    <td class="text-lg"><?= $site['date'] ?></td>
                                </tr>
                            <?php } ?>
                        </tbody>
                    </table>
                </section>
            </main>
        <?php } else { ?>
            <main class="p-4 w-full h-screen flex items-center justify-center">
                <section class="container mx-auto flex flex-col lg:w-[500px] gap-4">
                    <div class="flex flex-col gap-6 w-full p-4 bg-gray-100 rounded-md shadow-md">
                        <form action="./index.php" method="POST" class="w-full gap-4 flex flex-col">
                            <div class="flex flex-col gap-px">
                                <label for="password" class="text-[#1d1d1d] font-bold text-sm">Password</label>
                                <input x-password id="password" type="password" name="password" placeholder="Password" />
                            </div>
                            <div class="flex gap-4 items-center">
                                <button type="submit" name="submit" class="flex gap-2 items-center font-bold text-sm rounded-md bg-blue-500 text-[#fcfcfc] relative py-3 px-5 lg:px-3 lg:py-2 outline-none hover:!text-[#1d1d1d] hover:bg-blue-400 focus-within:!text-[#1d1d1d] focus-within:bg-blue-400 ms-auto">
                                    <svg class="block w-5 h-5 pointer-events-none" fill="currentcolor" viewBox="0 -960 960 960">
                                        <path d="M360-306q-13-15-13.5-33.25T360-371l63-63H134q-19.775 0-32.387-13.36Q89-460.719 89-479.86q0-20.14 12.613-32.64Q114.225-525 134-525h287l-64-67q-14-12.133-13.5-30.014t14.714-31.933Q370.661-666 389.705-665.5 408.75-665 424-653l142 142q5 6.16 9 14.813 4 8.654 4 17.4 0 8.747-4 17.267T566-448L424-305q-14 12-32 11.5T360-306ZM528-97q-19.775 0-32.388-13.36Q483-123.719 483-142.86q0-20.14 12.612-32.64Q508.225-188 528-188h253v-584H528q-19.775 0-32.388-12.86Q483-797.719 483-817.86q0-19.14 12.612-32.64Q508.225-864 528-864h253q36 0 63.5 27.5T872-772v584q0 37-27.5 64T781-97H528Z" />
                                    </svg>
                                    <span class="hidden lg:block">Login</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </section>
            </main>
        <?php } ?>
        <script src="./x.elements.js"></script>
        <script>
            x.Password().DataTable();
        </script>
    </body>

</html>