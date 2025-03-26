import socket
import argparse


def find_unavailable_udp_ports(start, end):
    unavailable_ports = []
    for port in range(start, end + 1):
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        try:
            # Try binding to the UDP port
            sock.bind(('0.0.0.0', port))
        except OSError:
            # If binding fails, the port is likely in use
            unavailable_ports.append(port)
        finally:
            sock.close()
    return unavailable_ports


if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        description="List unavailable UDP ports within a specified range."
    )
    parser.add_argument("--start", type=int, default=55000,
                        help="Start of port range (default: 55000)")
    parser.add_argument("--end", type=int, default=57000,
                        help="End of port range (default: 57000)")
    args = parser.parse_args()

    unavailable = find_unavailable_udp_ports(args.start, args.end)
    if unavailable:
        print(f"Unavailable UDP ports in the range {args.start}-{args.end}:")
        print(unavailable)
    else:
        print(
            f"All UDP ports in the range {args.start}-{args.end} are available.")
